require 'digest'
require 'puppet/util/execution'
require 'shellwords'

module PuppetX
  module Bodeco
    class Archive
      def initialize(file)
        @file = file
        @file_path = Shellwords.shellescape file
      end

      def checksum(type)
        return nil if type == :none

        digest = Digest.const_get(type.to_s.upcase)
        digest.file(@file).hexdigest
      rescue LoadError
        raise $ERROR_INFO, "invalid checksum type #{type}. #{$ERROR_INFO}", $ERROR_INFO.backtrace
      end

      def root_dir
        if Facter.value(:osfamily) == 'windows'
          'C:\\'
        else
          '/'
        end
      end

      def extract(path = root_dir, opts = {})
        opts = {
          custom_command: nil,
          options: '',
          uid: nil,
          gid: nil
        }.merge(opts)

        custom_command = opts.fetch(:custom_command, nil)
        options = opts.fetch(:options)
        Dir.chdir(path) do
          cmd = if custom_command && custom_command =~ %r{%s}
                  custom_command % @file_path
                elsif custom_command
                  "#{custom_command} #{options} #{@file_path}"
                else
                  command(options)
                end

          Puppet.debug("Archive extracting #{@file} in #{path}: #{cmd}")
          File.chmod(0o644, @file) if opts[:uid] || opts[:gid]
          Puppet::Util::Execution.execute(cmd, uid: opts[:uid], gid: opts[:gid], failonfail: true, squelch: false, combine: true)
        end
      end

      private

      def win_7zip
        if ENV['path'].include?('7-Zip')
          '7z.exe'
        elsif File.directory?('C:\\Program Files\\7-Zip')
          'C:\\Program Files\\7-Zip\\7z.exe'
        elsif File.directory?('C:\\Program Files (x86)\\7-zip')
          'C:\\Program Files (x86)\\7-Zip\\7z.exe'
        else
          raise Exception, '7z.exe not available'
        end
      end

      def command(options)
        if Facter.value(:osfamily) == 'windows'
          opt = parse_flags('x -aoa', options, '7z')
          "#{win_7zip} #{opt} #{@file_path}"
        else
          case @file
          when %r{\.tar$}
            opt = parse_flags('xf', options, 'tar')
            "tar #{opt} #{@file_path}"
          when %r{(\.tgz|\.tar\.gz)$}
            case Facter.value(:osfamily)
            when 'Solaris', 'AIX'
              gunzip_opt = parse_flags('-dc', options, 'gunzip')
              tar_opt = parse_flags('xf', options, 'tar')
              "gunzip #{gunzip_opt} #{@file_path} | tar #{tar_opt} -"
            else
              opt = parse_flags('xzf', options, 'tar')
              "tar #{opt} #{@file_path}"
            end
          when %r{(\.tbz|\.tar\.bz2)$}
            case Facter.value(:osfamily)
            when 'Solaris', 'AIX'
              bunzip_opt = parse_flags('-dc', options, 'bunzip')
              tar_opt = parse_flags('xf', options, 'tar')
              "bunzip2 #{bunzip_opt} #{@file_path} | tar #{tar_opt} -"
            else
              opt = parse_flags('xjf', options, 'tar')
              "tar #{opt} #{@file_path}"
            end
          when %r{(\.txz|\.tar\.xz)$}
            unxz_opt = parse_flags('-dc', options, 'unxz')
            tar_opt = parse_flags('xf', options, 'tar')
            "unxz #{unxz_opt} #{@file_path} | tar #{tar_opt} -"
          when %r{\.gz$}
            opt = parse_flags('-d', options, 'gunzip')
            "gunzip #{opt} #{@file_path}"
          when %r{(\.zip|\.war|\.jar)$}
            opt = parse_flags('-o', options, 'zip')
            "unzip #{opt} #{@file_path}"
          else
            raise NotImplementedError, "Unknown filetype: #{@file}"
          end
        end
      end

      def parse_flags(default, options, command = nil)
        case options
        when :undef
          default
        when ::String
          options
        when ::Hash
          options[command]
        else
          raise ArgumentError, "Invalid options for command #{command}: #{options.inspect}"
        end
      end
    end
  end
end
