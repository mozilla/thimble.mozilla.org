require 'puppet'
require 'mocha'

RSpec.configure do |config|
  config.mock_with :mocha
end

describe Puppet::Type.type(:rabbitmq_parameter).provider(:rabbitmqctl) do

  let(:resource) do
    Puppet::Type.type(:rabbitmq_parameter).new(
      :name           => 'documentumShovel@/',
      :component_name => 'shovel',
      :value          => {
        'src-uri'    => 'amqp://',
        'src-queue'  => 'my-queue',
        'dest-uri'   => 'amqp://remote-server',
        'dest-queue' => 'another-queue',
      },
      :provider => described_class.name
    )
  end

  let(:provider) { resource.provider }

  after(:each) do
    described_class.instance_variable_set(:@parameters, nil)
  end

  it 'should accept @ in parameter name' do
    resource = Puppet::Type.type(:rabbitmq_parameter).new(
      :name       => 'documentumShovel@/',
      :component_name => 'shovel',
      :value          => {
        'src-uri'    => 'amqp://',
        'src-queue'  => 'my-queue',
        'dest-uri'   => 'amqp://remote-server',
        'dest-queue' => 'another-queue',
      },
      :provider => described_class.name
    )
    provider = described_class.new(resource)
    provider.should_parameter.should == 'documentumShovel'
    provider.should_vhost.should == '/'
  end

  it 'should fail with invalid output from list' do
    provider.class.expects(:rabbitmqctl).with('list_parameters', '-q', '-p', '/').returns 'foobar'
    expect { provider.exists? }.to raise_error(Puppet::Error, /cannot parse line from list_parameter/)
  end

  it 'should match parameters from list' do
    provider.class.expects(:rabbitmqctl).with('list_parameters', '-q', '-p', '/').returns <<-EOT
shovel  documentumShovel  {"src-uri":"amqp://","src-queue":"my-queue","dest-uri":"amqp://remote-server","dest-queue":"another-queue"}
EOT
    provider.exists?.should == {
      :component_name => 'shovel',
      :value => {
        'src-uri'    => 'amqp://',
        'src-queue'  => 'my-queue',
        'dest-uri'   => 'amqp://remote-server',
        'dest-queue' => 'another-queue',
      }
    }
  end

  it 'should not match an empty list' do
    provider.class.expects(:rabbitmqctl).with('list_parameters', '-q', '-p', '/').returns ''
    provider.exists?.should == nil
  end

  it 'should destroy parameter' do
    provider.expects(:rabbitmqctl).with('clear_parameter', '-p', '/', 'shovel', 'documentumShovel')
    provider.destroy
  end

  it 'should only call set_parameter once' do
    provider.expects(:rabbitmqctl).with('set_parameter',
      '-p', '/',
      'shovel',
      'documentumShovel',
      '{"src-uri":"amqp://","src-queue":"my-queue","dest-uri":"amqp://remote-server","dest-queue":"another-queue"}'
    ).once
    provider.create
  end

end
