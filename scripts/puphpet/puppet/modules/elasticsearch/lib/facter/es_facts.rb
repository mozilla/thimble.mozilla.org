require 'net/http'
require 'json'
require 'yaml'

module EsFacts

  def self.add_fact(prefix, key, value)
    key = "#{prefix}_#{key}".to_sym
    ::Facter.add(key) do
      setcode { value }
    end
  end

  def self.run

    dir_prefix = '/etc/elasticsearch'
    ports = []

    # only when the directory exists we need to process the stuff
    if File.directory?(dir_prefix)

      Dir.foreach(dir_prefix) do |dir|
        next if dir == '.'

        if File.exists?("#{dir_prefix}/#{dir}/elasticsearch.yml")
          config_data = YAML.load_file("#{dir_prefix}/#{dir}/elasticsearch.yml")

          if not config_data['http.enabled'].nil? and \
              config_data['http.enabled'] == 'false'
            next
          elsif not config_data['http.port'].nil?
            port = config_data['http.port']
          else
            port = '9200'
          end

          ports << port
        end
      end

      begin
        if ports.count > 0

          add_fact('elasticsearch', 'ports', ports.join(",") )
          ports.each do |port|

            key_prefix = "elasticsearch_#{port}"

            uri = URI("http://localhost:#{port}")
            http = Net::HTTP.new(uri.host, uri.port)
            http.read_timeout = 10
            response = http.get("/")
            json_data = JSON.parse(response.body)
            next if json_data['status'] && json_data['status'] != 200

            add_fact(key_prefix, 'name', json_data['name'])
            add_fact(key_prefix, 'version', json_data['version']['number'])

            uri2 = URI("http://localhost:#{port}/_nodes/#{json_data['name']}")
            http2 = Net::HTTP.new(uri2.host, uri2.port)
            http2.read_timeout = 10
            response2 = http2.get(uri2.path)
            json_data_node = JSON.parse(response2.body)

            add_fact(key_prefix, 'cluster_name', json_data_node['cluster_name'])
            node_data = json_data_node['nodes'].first

            add_fact(key_prefix, 'node_id', node_data[0])

            nodes_data = json_data_node['nodes'][node_data[0]]

            process = nodes_data['process']
            add_fact(key_prefix, 'mlockall', process['mlockall'])

            plugins = nodes_data['plugins']

            plugin_names = []
            plugins.each do |plugin|
              plugin_names << plugin['name']

             plugin.each do |key, value|
                prefix = "#{key_prefix}_plugin_#{plugin['name']}"
                add_fact(prefix, key, value) unless key == 'name'
              end
            end
            add_fact(key_prefix, 'plugins', plugin_names.join(","))

          end

        end
      rescue
      end

    end

  end

end

EsFacts.run
