require 'uri'
Puppet::Type.newtype(:gnupg_key) do
  @doc = "Manage PGP public keys with GnuPG"

  ensurable

  autorequire(:package) do
    ["gnupg", "gnupg2"]
  end

  autorequire(:user) do
    self[:user]
  end

  KEY_SOURCES = [:key_source, :key_server, :key_content]

  KEY_CONTENT_REGEXES = {
    :public => ["-----BEGIN PGP PUBLIC KEY BLOCK-----", "-----END PGP PUBLIC KEY BLOCK-----"],
    :private => ["-----BEGIN PGP PRIVATE KEY BLOCK-----", "-----END PGP PRIVATE KEY BLOCK-----"]
  }

  validate do
    creator_count = 0
    KEY_SOURCES.each do |param|
      creator_count += 1 unless self[param].nil?
    end

    if creator_count > 1
      raise ArgumentError, "You cannot specify more than one of #{KEY_SOURCES.collect { |p| p.to_s}.join(", ")}, " +
        "much to learn, you still have."
    end

    if creator_count == 0 && self[:ensure] == :present
      raise ArgumentError, "You need to specify at least one of #{KEY_SOURCES.collect { |p| p.to_s}.join(", ")}, " +
        "much to learn, you still have."
    end

    if self[:ensure] == :present && self[:key_type] == :both
      raise ArgumentError, "A key type of 'both' is invalid when ensure is 'present'."
    end

    [:public, :private].each do |type|
      if self[:key_content] && self[:key_type] == type
        key_lines = self[:key_content].strip.lines.to_a

        first_line = key_lines.first.strip
        last_line = key_lines.last.strip

        unless first_line == KEY_CONTENT_REGEXES[type][0] && last_line == KEY_CONTENT_REGEXES[type][1]
          raise ArgumentError, "Provided key content does not look like a #{type} key."
        end
      end
    end
  end

  newparam(:name, :namevar => true) do
    desc "This attribute is currently used as a
      system-wide primary key - namevar and therefore has to be unique."
  end

  newparam(:user) do
    desc "The user account in which the PGP public key should be installed.
    Usually it's stored in HOME/.gnupg/ dir"

    validate do |value|
      # freebsd/linux username limitation
      unless value =~ /^[a-z_][a-z0-9_-]*[$]?/
        raise ArgumentError, "Invalid username format for #{value}"
      end
    end
  end

  newparam(:key_source) do
    desc <<-'EOT'
      A source file containing PGP key. Values can be URIs pointing to remote files,
      or fully qualified paths to files available on the local system.

      The available URI schemes are *puppet*, *https*, *http* and *file*. *Puppet*
      URIs will retrieve files from Puppet's built-in file server, and are
      usually formatted as:

      `puppet:///modules/name_of_module/filename`
    EOT

    validate do |source|

      raise ArgumentError, "Arrays not accepted as an source parameter" if source.is_a?(Array)
      break if Puppet::Util.absolute_path?(source)

      begin
        uri = URI.parse(URI.escape(source))
      rescue => detail
        raise ArgumentError, "Could not understand source #{source}: #{detail}"
      end

      raise ArgumentError, "Cannot use relative URLs '#{source}'" unless uri.absolute?
      raise ArgumentError, "Cannot use opaque URLs '#{source}'" unless uri.hierarchical?
      raise ArgumentError, "Cannot use URLs of type '#{uri.scheme}' as source for fileserving" unless %w{file puppet https http}.include?(uri.scheme)
    end

    munge do |source|
      if %w{file}.include?(URI.parse(URI.escape(source)).scheme)
        URI.parse(URI.escape(source)).path
      else
        source
      end
    end

  end

  newparam(:key_server) do
    desc "PGP key server from where to retrieve the public key"

    validate do |server|
      if server
        uri = URI.parse(URI.escape(server))
        unless uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS) ||
            uri.is_a?(URI::LDAP) || %w{hkp}.include?(uri.scheme)
          raise ArgumentError, "Invalid keyserver value #{server}"
        end
      end
    end

  end

  newparam(:key_content) do
    desc "Key content. The result of exporting the key using ASCII armor.
      Can be either a public or private key."
  end

  newparam(:key_id) do
    desc "Key ID. Usually the traditional 8-character key ID. Also accepted the
      long more accurate (but  less  convenient) 16-character key ID."

    validate do |value|
      unless (value.length == 8 or value.length == 16) and value =~ /^[0-9A-Fa-f]+$/
        raise ArgumentError, "Invalid key id #{value}"
      end
    end

    munge do |value|
      value.upcase.intern
    end
  end

  newparam(:key_type) do
    desc "The type of the key(s) being managed."

    newvalues(:public, :private, :both)

    defaultto :public
  end
end
