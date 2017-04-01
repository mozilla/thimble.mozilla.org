class NodeVersion < Array
  def initialize s
    super(s.split('.').map { |e| e.to_i })
  end
  def < x
    (self <=> x) < 0
  end
  def > x
    (self <=> x) > 0
  end
  def == x
    (self <=> x) == 0
  end
end


# Ideas from http://puppetlabs.com/blog/facter-part-3-caching-and-ttl
def get_cached_value(key, ttl=86400, dir = '/tmp/puppetfacts/nodejs', file = 'cache.yaml')
  cache_file = File.join(dir, file)

  if File::exist?(cache_file)
    cache = YAML.load_file(cache_file)
    value = cache[key]
    cache_time = File.mtime(cache_file)
  else
    value = nil
    cache_time = Time.at(0)
  end

  if !value || (Time.now - cache_time) > ttl then
    nil
  else
    value
  end
end


def set_cached_value(key, value, dir = '/tmp/puppetfacts/nodejs', file = 'cache.yaml')
  FileUtils.mkdir_p(dir) if !File::exists?(dir)
  cache_file = File.join(dir, file)

  cache = File::exist?(cache_file) ? YAML.load_file(cache_file) : Hash.new
  cache[key] = value

  File.open(cache_file, 'w') do |out|
    YAML.dump(cache, out)
  end
end


# inspired by https://github.com/visionmedia/n/blob/5630984059fb58f47def8dca2f25163456181ed3/bin/n#L363-L372
def get_version_list
  uri = URI('http://nodejs.org/dist/')

  http_proxy = ENV["http_proxy"]
  if http_proxy.to_s != ''
    if http_proxy =~ /^http[s]{0,1}:\/\/.*/
      proxy = URI.parse(http_proxy)
    else
      proxy = URI.parse('http://' + http_proxy)
    end
    request = Net::HTTP::Proxy(proxy.host, proxy.port).new(uri.host, uri.port)
  else
    request = Net::HTTP.new(uri.host, uri.port)
  end
  request.open_timeout = 2
  request.read_timeout = 2
  request.get(uri.request_uri).body
end


def get_latest_version
  match = get_version_list.scan(/[0-9]+\.[0-9]+\.[0-9]+/);
  match.sort! { |a,b| NodeVersion.new(a) <=> NodeVersion.new(b) };
  'v' + match.last
end


def get_stable_version
  match = get_version_list.scan(/[0-9]+\.[0-9]*[02468]\.[0-9]+/);
  match.sort! { |a,b| NodeVersion.new(a) <=> NodeVersion.new(b) };
  'v' + match.last
end
