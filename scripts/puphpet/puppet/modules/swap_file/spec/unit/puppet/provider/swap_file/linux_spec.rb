require 'spec_helper'

describe Puppet::Type.type(:swap_file).provider(:linux) do

  let(:resource) { Puppet::Type.type(:swap_file).new(
    {
    :name     => '/tmp/swap',
    :size     => '1024',
    :provider => described_class.name
    }
  )}

  let(:provider) { resource.provider }

  let(:instance) { provider.class.instances.first }

  swapon_s_output = <<-EOS
Filename                        Type            Size    Used    Priority
/dev/sda2                       partition       4192956 0       -1
/dev/sda1                       partition       4454542 0       -2
  EOS

  swapon_line = <<-EOS
/dev/sda2                       partition       4192956 0       -1
  EOS

  mkswap_return = <<-EOS
Setting up swapspace version 1, size = 524284 KiB
no label, UUID=0e5e7c60-bbba-4089-a76c-2bb29c0f0839
  EOS

  swapon_line_to_hash = {
    :ensure => :present,
    :file => "/dev/sda2",
    :name => "/dev/sda2",
    :priority => "-1",
    :provider => :swap_file,
    :size => "4192956",
    :type => "partition",
    :used => "0",
  }

  before :each do
    Facter.stubs(:value).with(:kernel).returns('Linux')
    provider.class.stubs(:swapon).with(['-s']).returns(swapon_s_output)
  end

  describe 'self.prefetch' do
    it 'exists' do
      provider.class.instances
      provider.class.prefetch({})
    end
  end

  describe 'exists?' do
    it 'checks if swap file exists' do
      expect(instance.exists?).to be_truthy
    end
  end

  describe 'self.instances' do
    it 'returns an array of swapfiles' do
      swapfiles      = provider.class.instances.collect {|x| x.name }
      swapfile_sizes = provider.class.instances.collect {|x| x.size }

      expect(swapfiles).to      include('/dev/sda1','/dev/sda2')
      expect(swapfile_sizes).to include('4192956','4454542')
    end
  end

  describe 'self.get_swapfile_properties' do
    it 'turns results from swapon -s line to hash' do
      swapon_line_to_hash_provider = provider.class.get_swapfile_properties(swapon_line)
      expect(swapon_line_to_hash_provider).to eql swapon_line_to_hash
    end
  end

  describe 'create_swap_file' do
    it 'runs mkswap and swapon' do
      provider.stubs(:mkswap).returns(mkswap_return)
      provider.stubs(:swapon).returns('')
      provider.create_swap_file('/tmp/swap')
    end
  end

  describe 'swap_off' do
    it 'runs swapoff and returns the log of the command' do
      provider.stubs(:swapoff).returns('')
      provider.swap_off('/tmp/swap')
    end
  end

end
