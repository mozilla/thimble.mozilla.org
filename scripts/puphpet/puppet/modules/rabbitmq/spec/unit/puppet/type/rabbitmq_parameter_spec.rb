require 'puppet'
require 'puppet/type/rabbitmq_parameter'

describe Puppet::Type.type(:rabbitmq_parameter) do

  before do
    @parameter = Puppet::Type.type(:rabbitmq_parameter).new(
      :name           => 'documentumShovel@/',
      :component_name => 'shovel',
      :value          => {
        'src-uri' => 'amqp://myremote-server',
        'src-queue' => 'queue.docs.outgoing',
        'dest-uri' => 'amqp://',
        'dest-queue' => 'queue.docs.incoming',
      })
  end

  it 'should accept a valid name' do
    @parameter[:name] = 'documentumShovel@/'
    @parameter[:name].should == 'documentumShovel@/'
  end

  it 'should require a name' do
    expect {
      Puppet::Type.type(:rabbitmq_parameter).new({})
    }.to raise_error(Puppet::Error, 'Title or name must be provided')
  end

  it 'should fail when name does not have a @' do
    expect {
      @parameter[:name] = 'documentumShovel'
    }.to raise_error(Puppet::Error, /Valid values match/)
  end

  it 'should accept a string' do
    @parameter[:component_name] = 'mystring'
    @parameter[:component_name].should == 'mystring'
  end

  it 'should not be empty' do
    expect {
      @parameter[:component_name] = ''
    }.to raise_error(Puppet::Error, /component_name must be defined/)
  end

  it 'should accept a valid hash for value' do
    value =  {'message-ttl' => '1800000'}
    @parameter[:value] = value
    @parameter[:value].should == value
  end

  it 'should not accept invalid hash for definition' do
    expect {
      @parameter[:value] = ''
    }.to raise_error(Puppet::Error, /Invalid value/)

    expect {
      @parameter[:value] = 'guest'
    }.to raise_error(Puppet::Error, /Invalid value/)

    expect {
      @parameter[:value] = {'message-ttl' => ['999', '100']}
    }.to raise_error(Puppet::Error, /Invalid value/)
  end

  it 'should accept string as myparameter' do
    value = {'myparameter' => 'mystring'}
    @parameter[:value] = value
    @parameter[:value]['myparameter'].should be_a(String)
    @parameter[:value]['myparameter'].should == 'mystring'
  end


  it 'should convert to integer when string only contains numbers' do
    value = {'myparameter' => '1800000'}
    @parameter[:value] = value
    @parameter[:value]['myparameter'].should be_a(Fixnum)
    @parameter[:value]['myparameter'].should == 1800000
  end

end
