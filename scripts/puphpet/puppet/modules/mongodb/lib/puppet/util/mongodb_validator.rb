require 'socket'
require 'timeout'
require 'ipaddr'
require 'uri'

module Puppet
  module Util
    class MongodbValidator
      attr_reader :mongodb_server
      attr_reader :mongodb_port

      def initialize(mongodb_resource_name, mongodb_server, mongodb_port)
        begin
          # NOTE (spredzy) : By relying on the uri module
          # we rely on its well tested interface to parse
          # both IPv4 and IPv6 based URL with a port specified.
          # Unfortunately URI needs a scheme, hence the http
          # string here to make the string URI compliant.
          uri = URI("http://#{mongodb_resource_name}")
          @mongodb_server = IPAddr.new(uri.host).to_s
          @mongodb_port = uri.port
        rescue
          @mongodb_server = IPAddr.new(mongodb_server).to_s
          @mongodb_port   = mongodb_port
        end
      end

      # Utility method; attempts to make an https connection to the mongodb server.
      # This is abstracted out into a method so that it can be called multiple times
      # for retry attempts.
      #
      # @return true if the connection is successful, false otherwise.
      def attempt_connection
        Timeout::timeout(Puppet[:http_connect_timeout]) do
          begin
            TCPSocket.new(@mongodb_server, @mongodb_port).close
            true
          rescue Errno::ECONNREFUSED, Errno::EHOSTUNREACH => e
            Puppet.debug "Unable to connect to mongodb server (#{@mongodb_server}:#{@mongodb_port}): #{e.message}"
            false
          end
        end
      rescue Timeout::Error
        false
      end
    end
  end
end

