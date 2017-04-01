require 'spec_helper'

describe :go_md5 do
  before :all do
    Puppet::Parser::Functions.autoloader.loadall
  end

  let(:scope) { PuppetlabsSpec::PuppetInternals.scope }
  example_md5 = File.read(fixtures('checksum', 'gocd.md5'))

  it 'retreives file md5' do
    url = 'https://gocd.lan/path/file.md5'
    uri = URI(url)
    PuppetX::Bodeco::Util.stubs(:content).with(uri, username: 'user', password: 'pass').returns(example_md5)
    expect(scope.function_go_md5(['user', 'pass', 'filea', url])).to eq '283158c7da8c0ada74502794fa8745eb'
  end
end
