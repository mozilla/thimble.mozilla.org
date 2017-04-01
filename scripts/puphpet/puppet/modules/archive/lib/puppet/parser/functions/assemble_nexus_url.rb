require 'cgi'

module Puppet::Parser::Functions
  newfunction(:assemble_nexus_url, type: :rvalue) do |args|
    service_relative_url = 'service/local/artifact/maven/content'

    nexus_url = args[0]
    params = args[1]
    query_string = params.to_a.map { |x| "#{x[0]}=#{CGI.escape(x[1])}" }.join('&')

    "#{nexus_url}/#{service_relative_url}?#{query_string}"
  end
end
