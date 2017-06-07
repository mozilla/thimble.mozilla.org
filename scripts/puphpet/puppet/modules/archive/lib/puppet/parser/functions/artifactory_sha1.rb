module Puppet::Parser::Functions
  # Public: artifactory file sha1 checksum
  #
  # args[0] - artifactory file info url
  #
  # http://www.jfrog.com/confluence/display/RTF/Artifactory+REST+API#ArtifactoryRESTAPI-FileInfo
  # Returns sha1 from artifactory file info
  newfunction(:artifactory_sha1, type: :rvalue) do |args|
    raise(ArgumentError, "Invalid artifactory file info url #{args}") unless args.size == 1

    require 'json'
    require 'puppet_x/bodeco/util.rb'

    uri = URI(args[0])
    response = PuppetX::Bodeco::Util.content(uri)
    content = JSON.parse(response)

    sha1 = content['checksums'] && content['checksums']['sha1']
    raise("Could not parse sha1 from url: #{args[0]}\nresponse: #{response.body}") unless sha1 =~ %r{\b[0-9a-f]{5,40}\b}
    sha1
  end
end
