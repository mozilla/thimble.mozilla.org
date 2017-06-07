require 'spec_helper'

describe :assemble_nexus_url do
  before :all do
    Puppet::Parser::Functions.autoloader.loadall
  end

  let(:scope) { PuppetlabsSpec::PuppetInternals.scope }

  nexus_url = 'http://nexus.local'

  it 'builds url correctly' do
    expected_url = 'http://nexus.local/service/local/artifact/maven/content?g=com.test&a=test&v=1.0.0&r=binary-staging&p=ear'

    parameters = {
      'g' => 'com.test',
      'a' => 'test',
      'v' => '1.0.0',
      'r' => 'binary-staging',
      'p' => 'ear'
    }

    expect(scope.function_assemble_nexus_url([nexus_url, parameters])).to eq expected_url
  end

  it 'builds url with version containing "+" sign correctly' do
    expected_url = 'http://nexus.local/service/local/artifact/maven/content?g=com.test&a=test&v=1.0.0%2B11&r=binary-staging&p=ear'

    parameters = {
      'g' => 'com.test',
      'a' => 'test',
      'v' => '1.0.0+11',
      'r' => 'binary-staging',
      'p' => 'ear'
    }

    expect(scope.function_assemble_nexus_url([nexus_url, parameters])).to eq expected_url
  end
end
