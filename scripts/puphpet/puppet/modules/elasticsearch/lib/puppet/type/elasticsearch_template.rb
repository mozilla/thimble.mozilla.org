$LOAD_PATH.unshift(File.join(File.dirname(__FILE__),"..","..",".."))

require 'puppet/file_serving/content'
require 'puppet/file_serving/metadata'
require 'puppet/parameter/boolean'

require 'puppet_x/elastic/deep_implode'
require 'puppet_x/elastic/deep_to_i'

Puppet::Type.newtype(:elasticsearch_template) do
  desc 'Manages Elasticsearch index templates.'

  ensurable do
    defaultvalues
    defaultto :present
  end

  newparam(:name, :namevar => true) do
    desc 'Template name.'
  end

  newproperty(:content) do
    desc 'Structured content of template.'

    validate do |value|
      raise Puppet::Error, 'hash expected' unless value.is_a? Hash
    end

    munge do |value|

      # The Elasticsearch API will return default empty values for
      # order, aliases, and mappings if they aren't defined in the
      # user mapping, so we need to set defaults here to keep the
      # `in` and `should` states consistent if the user hasn't
      # provided any.
      #
      # We use deep_to_i to ensure any numeric values are properly
      # parsed, whether from user-defined resources or when reading
      # from the API.
      #
      # We also need to fully qualify index settings, since users
      # can define those with the index json key absent, but the API
      # always fully qualifies them.
      {'order'=>0,'aliases'=>{},'mappings'=>{}}.merge(
        Puppet_X::Elastic::deep_to_i(
          value.tap do |val|
            if val.has_key? 'settings'
              unless val['settings'].has_key? 'index'
                val['settings']['index'] = {}
              end
              (val['settings'].keys - ['index']).each do |setting|
                val['settings']['index'][setting] = \
                  val['settings'].delete(setting)
              end
            end
          end
      ))
    end

    def insync?(is)
      Puppet_X::Elastic::deep_implode(is) == \
        Puppet_X::Elastic::deep_implode(should)
    end
  end

  newparam(:source) do
    desc 'Puppet source to file containing template contents.'

    validate do |value|
      raise Puppet::Error, 'string expected' unless value.is_a? String
    end
  end

  newparam(:host) do
    desc 'Optional host where Elasticsearch is listening.'
    defaultto 'localhost'

    validate do |value|
      unless value.is_a? String
        raise Puppet::Error, 'invalid parameter, expected string'
      end
    end
  end

  newparam(:port) do
    desc 'Port to use for Elasticsearch HTTP API operations.'
    defaultto 9200

    munge do |value|
      if value.is_a? String
        value.to_i
      elsif value.is_a? Fixnum
        value
      else
        raise Puppet::Error, "unknown '#{value}' timeout type '#{value.class}'"
      end
    end

    validate do |value|
      if value.to_s =~ /^([0-9]+)$/
        unless (0 < $1.to_i) and ($1.to_i < 65535)
          raise Puppet::Error, "invalid port value '#{value}'"
        end
      else
        raise Puppet::Error, "invalid port value '#{value}'"
      end
    end
  end

  newparam(:protocol) do
    desc 'Protocol to communicate over to Elasticsearch.'
    defaultto 'http'
  end

  newparam(
    :validate_tls,
    :boolean => true,
    :parent => Puppet::Parameter::Boolean
  ) do
    desc 'Whether to verify TLS/SSL certificates.'
    defaultto true
  end

  newparam(:timeout) do
    desc 'HTTP timeout for reading/writing content to Elasticsearch.'
    defaultto 10

    munge do |value|
      if value.is_a? String
        value.to_i
      elsif value.is_a? Fixnum
        value
      else
        raise Puppet::Error, "unknown '#{value}' timeout type '#{value.class}'"
      end
    end

    validate do |value|
      if value.to_s !~ /^\d+$/
        raise Puppet::Error, 'timeout must be a positive integer'
      end
    end
  end

  newparam(:username) do
    desc 'Optional HTTP basic authentication username for Elasticsearch.'
  end

  newparam(:password) do
    desc 'Optional HTTP basic authentication plaintext password for Elasticsearch.'
  end

  validate do

    # Ensure that at least one source of template content has been provided
    if self[:ensure] == :present
      if self[:content].nil? and self[:source].nil?
        fail Puppet::ParseError, '"content" or "source" required'
      elsif !self[:content].nil? and !self[:source].nil?
        fail(Puppet::ParseError,
             "'content' and 'source' cannot be simultaneously defined")
      end
    end

    # If a source was passed, retrieve the source content from Puppet's
    # FileServing indirection and set the content property
    if !self[:source].nil?
      unless Puppet::FileServing::Metadata.indirection.find(self[:source])
        fail "Could not retrieve source %s" % self[:source]
      end

      if not self.catalog.nil? and \
          self.catalog.respond_to?(:environment_instance)
        tmp = Puppet::FileServing::Content.indirection.find(
          self[:source],
          :environment => self.catalog.environment_instance
        )
      else
        tmp = Puppet::FileServing::Content.indirection.find(self[:source])
      end

      fail "Could not find any content at %s" % self[:source] unless tmp
      self[:content] = PSON::load(tmp.content)
    end
  end
end # of newtype
