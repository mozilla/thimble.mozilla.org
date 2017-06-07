require 'spec_helper'

describe Puppet::Type.type(:git_config).provider(:git_config) do

  let(:resource) { Puppet::Type.type(:git_config).new(
    {
    :key       => 'user.email',
    :value     => 'john.doe@example.com',
    }
  )}

  let(:provider) { resource.provider }

end