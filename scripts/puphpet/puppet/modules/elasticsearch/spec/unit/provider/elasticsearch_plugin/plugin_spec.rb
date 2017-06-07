require 'spec_helper'
require_relative 'shared_examples'

provider_class = Puppet::Type.type(:elasticsearch_plugin).provider(:plugin)

describe provider_class do

  let(:resource_name) { 'lmenezes/elasticsearch-kopf' }
  let(:resource) do
    Puppet::Type.type(:elasticsearch_plugin).new(
      :name     => resource_name,
      :ensure   => :present,
      :provider => 'plugin'
    )
  end
  let(:provider) do
    provider = provider_class.new
    provider.resource = resource
    provider
  end
  let(:klass) { provider_class }

  include_examples 'plugin provider',
    '1.x',
    'Version: 1.7.1, Build: b88f43f/2015-07-29T09:54:16Z, JVM: 1.7.0_79'

  include_examples 'plugin provider',
    '2.x',
    'Version: 2.0.0, Build: de54438/2015-10-22T08:09:48Z, JVM: 1.8.0_66'
end
