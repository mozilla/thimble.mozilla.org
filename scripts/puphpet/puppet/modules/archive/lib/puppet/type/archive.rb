require 'pathname'
require 'uri'
require 'puppet/util'
require 'puppet/parameter/boolean'

Puppet::Type.newtype(:archive) do
  @doc = 'Manage archive file download, extraction, and cleanup.'

  ensurable do
    desc 'whether archive file should be present/absent (default: present)'

    newvalue(:present) do
      provider.create
    end

    newvalue(:absent) do
      provider.destroy
    end

    defaultto(:present)

    # The following changes allows us to notify if the resource is being replaced
    def is_to_s(value) # rubocop:disable Style/PredicateName
      return "(#{resource[:checksum_type]})#{provider.archive_checksum}" if provider.archive_checksum
      super
    end

    def should_to_s(value)
      return "(#{resource[:checksum_type]})#{resource[:checksum]}" if provider.archive_checksum
      super
    end

    def change_to_s(currentvalue, newvalue)
      if currentvalue == :absent || currentvalue.nil?
        extract = resource[:extract] == :true ? "and extracted in #{resource[:extract_path]}" : ''
        cleanup = resource[:cleanup] == :true ? 'with cleanup' : 'without cleanup'

        if provider.archive_checksum
          "replace archive: #{provider.archive_filepath} from #{is_to_s(currentvalue)} to #{should_to_s(newvalue)}"
        else
          "download archive from #{resource[:source]} to #{provider.archive_filepath} #{extract} #{cleanup}"
        end
      elsif newvalue == :absent
        "remove archive: #{provider.archive_filepath} "
      else
        super
      end
    rescue StandardError
      super
    end
  end

  newparam(:path, namevar: true) do
    desc 'namevar, archive file fully qualified file path.'
    validate do |value|
      unless Puppet::Util.absolute_path? value
        raise ArgumentError, "archive path must be absolute: #{value}"
      end
    end
  end

  newparam(:filename) do
    desc 'archive file name (derived from path).'
  end

  newparam(:extract) do
    desc 'whether archive will be extracted after download (true|false).'
    newvalues(:true, :false)
    defaultto(:false)
  end

  newparam(:extract_path) do
    desc 'target folder path to extract archive.'
    validate do |value|
      unless Puppet::Util.absolute_path? value
        raise ArgumentError, "archive extract_path must be absolute: #{value}"
      end
    end
  end
  newparam(:target) do
    desc 'target folder path to extract archive. (this parameter is for camptocamp/archive compatibility)'
    validate do |value|
      unless Puppet::Util.absolute_path? value
        raise ArgumentError, "archive extract_path must be absolute: #{value}"
      end
    end
    munge do |val|
      resource[:extract_path] = val
    end
  end

  newparam(:extract_command) do
    desc "custom extraction command ('tar xvf example.tar.gz'), also support sprintf format ('tar xvf %s') which will be processed with the filename: sprintf('tar xvf %s', filename)"
  end

  newparam(:extract_flags) do
    desc "custom extraction options, this replaces the default flags. A string such as 'xvf' for a tar file would replace the default xf flag. A hash is useful when custom flags are needed for different platforms. {'tar' => 'xzf', '7z' => 'x -aot'}."
    defaultto(:undef)
  end

  newproperty(:creates) do
    desc 'if file/directory exists, will not download/extract archive.'

    def should_to_s(value)
      "extracting in #{resource[:extract_path]} to create #{value}"
    end
  end

  newparam(:cleanup) do
    desc 'whether archive file will be removed after extraction (true|false).'
    newvalues(:true, :false)
    defaultto(:true)
  end

  newparam(:source) do
    desc 'archive file source, supports http|https|ftp|file|s3 uri.'
    validate do |value|
      unless value =~ URI.regexp(%w(http https ftp file s3)) || Puppet::Util.absolute_path?(value)
        raise ArgumentError, "invalid source url: #{value}"
      end
    end
  end

  newparam(:url) do
    desc 'archive file source, supports http|https|ftp|file uri.
    (for camptocamp/archive compatibility)'
    validate do |value|
      unless value =~ URI.regexp(%w(http https file ftp))
        raise ArgumentError, "invalid source url: #{value}"
      end
    end
    munge do |val|
      resource[:source] = val
    end
  end

  newparam(:cookie) do
    desc 'archive file download cookie.'
  end

  newparam(:checksum) do
    desc 'archive file checksum (match checksum_type).'
    newvalues(%r{\b[0-9a-f]{5,128}\b}, :true, :false, :undef, nil, '')
    munge do |val|
      if val.nil? || val.empty? || val == :undef
        :false
      elsif val == :true || val == :false
        resource[:checksum_verify] = val
      else
        val
      end
    end
  end
  newparam(:digest_string) do
    desc 'archive file checksum (match checksum_type)
    (this parameter is for camptocamp/archive compatibility).'
    newvalues(%r{\b[0-9a-f]{5,128}\b})
    munge do |val|
      if !val.nil? && !val.empty?
        resource[:checksum] = val
      else
        val
      end
    end
  end

  newparam(:checksum_url) do
    desc 'archive file checksum source (instead of specifying checksum)'
  end
  newparam(:digest_url) do
    desc 'archive file checksum source (instead of specifying checksum)
    (this parameter is for camptocamp/archive compatibility)'
    munge do |val|
      resource[:checksum_url] = val
    end
  end

  newparam(:checksum_type) do
    desc 'archive file checksum type (none|md5|sha1|sha2|sh256|sha384|sha512).'
    newvalues(:none, :md5, :sha1, :sha2, :sha256, :sha384, :sha512)
    defaultto(:none)
  end
  newparam(:digest_type) do
    desc 'archive file checksum type (none|md5|sha1|sha2|sh256|sha384|sha512)
    (this parameter is camptocamp/archive compatibility).'
    newvalues(:none, :md5, :sha1, :sha2, :sha256, :sha384, :sha512)
    munge do |val|
      resource[:checksum_type] = val
    end
  end

  newparam(:checksum_verify) do
    desc 'whether checksum wil be verified (true|false).'
    newvalues(:true, :false)
    defaultto(:true)
  end

  newparam(:username) do
    desc 'username to download source file.'
  end

  newparam(:password) do
    desc 'password to download source file.'
  end

  newparam(:user) do
    desc 'extract command user (using this option will configure the archive file permission to 0644 so the user can read the file).'
  end

  newparam(:group) do
    desc 'extract command group (using this option will configure the archive file permisison to 0644 so the user can read the file).'
  end

  newparam(:proxy_type) do
    desc 'proxy type (none|ftp|http|https)'
    newvalues(:none, :ftp, :http, :https)
  end

  newparam(:proxy_server) do
    desc 'proxy address to use when accessing source'
  end

  newparam(:allow_insecure, boolean: true, parent: Puppet::Parameter::Boolean) do
    desc 'ignore HTTPS certificate errors'
    defaultto :false
  end

  autorequire(:file) do
    [
      Pathname.new(self[:path]).parent.to_s,
      self[:extract_path],
      '/root/.aws/config',
      '/root/.aws/credentials'
    ].compact
  end

  autorequire(:exec) do
    ['install_aws_cli']
  end

  validate do
    filepath = Pathname.new(self[:path])
    self[:filename] = filepath.basename.to_s
    if !self[:source].nil? && !self[:url].nil? && self[:source] != self[:url]
      raise ArgumentError, "invalid parameter: url (#{self[:url]}) and source (#{self[:source]}) are mutually exclusive."
    end
    if !self[:checksum_url].nil? && !self[:digest_url].nil? && self[:checksum_url] != self[:digest_url]
      raise ArgumentError, "invalid parameter: checksum_url (#{self[:checksum_url]}) and digest_url (#{self[:digest_url]}) are mutually exclusive."
    end
    if self[:proxy_server]
      self[:proxy_type] ||= URI(self[:proxy_server]).scheme.to_sym
    else
      self[:proxy_type] = :none
    end
  end
end
