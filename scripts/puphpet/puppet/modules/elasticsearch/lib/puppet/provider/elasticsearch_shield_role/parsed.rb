require 'puppet/provider/elastic_yaml'

case Facter.value('osfamily')
when 'OpenBSD'
  roles = '/usr/local/elasticsearch/shield/roles.yml'
else
  roles = '/usr/share/elasticsearch/shield/roles.yml'
end

Puppet::Type.type(:elasticsearch_shield_role).provide(
  :parsed,
  :parent => Puppet::Provider::ElasticYaml,
  :default_target => roles,
  :metadata => :privileges
) do
  desc "Provider for Shield role resources."
end
