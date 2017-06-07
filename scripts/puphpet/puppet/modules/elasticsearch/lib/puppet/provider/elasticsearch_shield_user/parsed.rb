require 'puppet/provider/parsedfile'

case Facter.value('osfamily')
when 'OpenBSD'
  users = '/usr/local/elasticsearch/shield/users'
else
  users = '/usr/share/elasticsearch/shield/users'
end

Puppet::Type.type(:elasticsearch_shield_user).provide(
  :parsed,
  :parent => Puppet::Provider::ParsedFile,
  :default_target => users
) do
  desc "Provider for Shield esusers using plain files."

  confine :exists => users

  has_feature :manages_passwords

  text_line :comment,
            :match => %r{^\s*#}

  record_line :parsed,
              :fields => %w{name hashed_password},
              :separator => ':',
              :joiner => ':'

  def self.valid_attr?(klass, attr_name)
    if klass.respond_to? :parameters
      klass.parameters.include?(attr_name)
    else
      true
    end
  end
end
