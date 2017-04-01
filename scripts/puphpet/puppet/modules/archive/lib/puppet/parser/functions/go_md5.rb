module Puppet::Parser::Functions
  # Public: go file md5 checksum
  #
  # args[0] - username
  # args[1] - password
  # args[2] - file_name
  # args[3] - go md5 checksum url
  #
  # http://www.thoughtworks.com/products/docs/go/12.4/help/Artifacts_API.html
  #
  # Returns specific file's md5 from go server md5 checksum file
  newfunction(:go_md5, type: :rvalue) do |args|
    raise(ArgumentError, "Invalid go md5 info url #{args}") unless args.size == 4

    require 'puppet_x/bodeco/util.rb'

    username, password, file, url = args

    uri = URI(url)
    response = PuppetX::Bodeco::Util.content(uri, username: username, password: password)

    checksums = response.split("\n")
    line = checksums.find { |x| x =~ %r{#{file}=} }
    md5 = line.match(%r{\b[0-9a-f]{5,40}\b})
    raise("Could not parse md5 from url#{url} response: #{response.body}") unless md5
    md5[0]
  end
end
