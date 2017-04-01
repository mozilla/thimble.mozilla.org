require 'spec_helper'

describe :artifactory_sha1 do
  before :all do
    Puppet::Parser::Functions.autoloader.loadall
  end

  let(:scope) { PuppetlabsSpec::PuppetInternals.scope }
  example_json = File.read(fixtures('checksum', 'artifactory.json'))

  it 'parses sha1' do
    url = 'https://repo.jfrog.org/artifactory/api/storage/distributions/images/Artifactory_120x75.png'
    uri = URI(url)
    PuppetX::Bodeco::Util.stubs(:content).with(uri).returns(example_json)
    expect(scope.function_artifactory_sha1([url])).to eq 'a359e93636e81f9dd844b2dfb4b89fa876e5d4fa'
  end
end
