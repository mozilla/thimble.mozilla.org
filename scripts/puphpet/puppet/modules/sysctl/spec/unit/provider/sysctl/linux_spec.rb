require 'spec_helper'

provider_class = Puppet::Type.type(:sysctl).provider(:linux)

describe provider_class do
  subject { provider_class }

  let (:lines) { '
net.ipv6.route.gc_elasticity = 0
net.ipv6.route.mtu_expires = 600
net.ipv6.route.min_adv_mss = 1
vm.swappiness = 0
'}
  let(:resource) do
    Puppet::Type.type(:sysctl).new(
      :name     => 'vm.swappiness',
      :ensure   => :present,
      :value    => 0,
      :path     => '/etc/sysctl.conf'
    )
  end
  let(:provider) do
    provider = provider_class.new
    provider.resource = resource
    provider
  end

  let (:sysctloutput) { "net.ipv6.route.gc_elasticity = 0\nnet.ipv6.route.mtu_expires = 600\nnet.ipv6.route.min_adv_mss = 1\nvm.swappiness = 0\n" }
#  let(:sysctloutput) do
#    <<-OUTPUT
#net.ipv6.route.gc_elasticity = 0
#net.ipv6.route.mtu_expires = 600
#net.ipv6.route.min_adv_mss = 1
#vm.swappiness = 0
#OUTPUT
#  end
  let(:sysctlconf_edit) do
    <<-OUTPUT
net.ipv6.route.gc_elasticity = 0
net.ipv6.route.mtu_expires = 600
net.ipv6.route.min_adv_mss = 1
OUTPUT
  end

  before(:each) do
    Puppet::Util.stubs(:which).with("sysctl").returns("/sbin/sysctl")
    subject.stubs(:which).with("sysctl").returns("/sbin/sysctl")
  end

  let(:parsed_params) { %w( net.ipv6.route.gc_elasticity net.ipv6.route.mtu_expires net.ipv6.route.min_adv_mss vm.swappiness ) }

  before :each do
    @resource = Puppet::Type::Sysctl.new(
      { :name => 'vm.swappiness', :value => 0, }
    )
    @provider = provider_class.new(@resource)
    Puppet::Util.stubs(:which).with('sysctl').returns('/sbin/sysctl')
    subject.stubs(:which).with('sysctl').returns('/sbin/sysctl')
    Facter.stubs(:value).with(:kernel).returns('linux')
    subject.stubs(:sysctl).with('-a').returns(sysctloutput)
    subject.stubs(:lines).yields(sysctloutput)
    puts sysctloutput
  end

  after :each do
  end

  describe 'self.instances' do
    it 'returns an array of sysctl' do
      params = subject.instances
      puts params[0].permanent
      params_array = params.collect { |x| x.name } 
      params_array.should match_array(parsed_params)
    end
  end
# describe 'self.lines' do
#   it 'returns an some text' do
#   end
# end


end
