require 'puppet/provider/elastic_yaml'

case Facter.value('osfamily')
when 'OpenBSD'
  mappings = '/usr/local/elasticsearch/shield/role_mapping.yml'
else
  mappings = '/usr/share/elasticsearch/shield/role_mapping.yml'
end

Puppet::Type.type(:elasticsearch_shield_role_mapping).provide(
  :parsed,
  :parent => Puppet::Provider::ElasticYaml,
  :default_target => mappings,
  :metadata => :mappings
) do
  desc "Provider for Shield role mappings."
end
