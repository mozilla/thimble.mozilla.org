module PuppetX
  module Bodeco
    module Util
      def self.download(url, filepath, options = {})
        uri = URI(url)
        @connection = PuppetX::Bodeco.const_get(uri.scheme.upcase).new("#{uri.scheme}://#{uri.host}:#{uri.port}", options)
        @connection.download(uri, filepath)
      end

      def self.content(url, options = {})
        uri = URI(url)
        @connection = PuppetX::Bodeco.const_get(uri.scheme.upcase).new("#{uri.scheme}://#{uri.host}:#{uri.port}", options)
        @connection.content(uri)
      end
    end

    class HTTP
      require 'net/http'

      FOLLOW_LIMIT = 5
      URI_UNSAFE = %r{[^\-_.!~*'()a-zA-Z\d;\/?:@&=+$,\[\]%]}

      def initialize(_url, options)
        @username = options[:username]
        @password = options[:password]
        @cookie = options[:cookie]
        @insecure = options[:insecure]
        proxy_server = options[:proxy_server]
        proxy_type = options[:proxy_type]

        ENV["#{proxy_type}_proxy"] = proxy_server

        ENV['SSL_CERT_FILE'] = File.expand_path(File.join(__FILE__, '..', 'cacert.pem')) if Facter.value(:osfamily) == 'windows' && !ENV.key?('SSL_CERT_FILE')
      end

      def generate_request(uri)
        header = @cookie && { 'Cookie' => @cookie }

        request = Net::HTTP::Get.new(uri.request_uri, header)
        request.basic_auth(@username, @password) if @username && @password
        request
      end

      def follow_redirect(uri, option = { limit: FOLLOW_LIMIT }, &block)
        http_opts = if uri.scheme == 'https'
                      { use_ssl: true,
                        verify_mode: (@insecure ? OpenSSL::SSL::VERIFY_NONE : OpenSSL::SSL::VERIFY_PEER) }
                    else
                      { use_ssl: false }
                    end
        Net::HTTP.start(uri.host, uri.port, http_opts) do |http|
          http.request(generate_request(uri)) do |response|
            case response
            when Net::HTTPSuccess
              yield response
            when Net::HTTPRedirection
              limit = option[:limit] - 1
              raise Puppet::Error, "Redirect limit exceeded, last url: #{uri}" if limit < 0
              location = safe_escape(response['location'])
              new_uri = URI(location)
              new_uri = URI(uri.to_s + location) if new_uri.relative?
              follow_redirect(new_uri, limit: limit, &block)
            else
              raise Puppet::Error, "HTTP Error Code #{response.code}\nURL: #{uri}\nContent:\n#{response.body}"
            end
          end
        end
      end

      def download(uri, file_path, option = { limit: FOLLOW_LIMIT })
        follow_redirect(uri, option) do |response|
          File.open file_path, 'wb' do |io|
            response.read_body do |chunk|
              io.write chunk
            end
          end
        end
      end

      def content(uri, option = { limit: FOLLOW_LIMIT })
        follow_redirect(uri, option) do |response|
          return response.body
        end
      end

      def safe_escape(uri)
        uri.to_s.gsub(URI_UNSAFE) do |match|
          '%' + match.unpack('H2' * match.bytesize).join('%').upcase
        end
      end
    end

    class HTTPS < HTTP
    end

    class FTP
      require 'net/ftp'

      def initialize(url, options)
        uri = URI(url)
        username = options[:username]
        password = options[:password]
        proxy_server = options[:proxy_server]
        proxy_type = options[:proxy_type]

        ENV["#{proxy_type}_proxy"] = proxy_server

        @ftp = Net::FTP.new
        @ftp.connect(uri.host, uri.port)
        if username
          @ftp.login(username, password)
        else
          @ftp.login
        end
      end

      def download(uri, file_path)
        @ftp.getbinaryfile(uri.path, file_path)
      end
    end

    class FILE
      def initialize(_url, _options)
      end

      def download(uri, file_path)
        FileUtils.copy(uri.path, file_path)
      end
    end
  end
end
