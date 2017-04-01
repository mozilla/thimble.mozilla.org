require 'puppet'
require 'puppet/type/rabbitmq_plugin'
describe Puppet::Type.type(:rabbitmq_plugin) do
  before :each do
    @plugin = Puppet::Type.type(:rabbitmq_plugin).new(:name => 'foo')
  end
  it 'should accept a plugin name' do
    @plugin[:name] = 'plugin-name'
    @plugin[:name].should == 'plugin-name'
  end
  it 'should require a name' do
    expect {
      Puppet::Type.type(:rabbitmq_plugin).new({})
    }.to raise_error(Puppet::Error, 'Title or name must be provided')
  end
  it 'should default to a umask of 0022' do
    @plugin[:umask].should == 0022
  end
  it 'should not allow a non-octal value to be specified' do
    expect {
      @plugin[:umask] = '198'
    }.to raise_error(Puppet::Error, /The umask specification is invalid: "198"/)
  end
end
