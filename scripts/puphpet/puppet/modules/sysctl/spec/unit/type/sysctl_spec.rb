require 'puppet'
require 'spec_helper'
describe Puppet::Type.type(:sysctl) do
  subject { Puppet::Type.type(:sysctl).new(:name => 'vm.swappiness') }

  it 'should accept ensure' do
    subject[:ensure] = :present
    subject[:ensure].should == :present
  end

  it 'should accept ensure' do
    subject[:ensure] = :absent
    subject[:ensure].should == :absent
  end

  it 'value should accept values' do
    subject[:value] = '0'
    subject[:value].should == '0'
  end

  it 'should accept yes as a value for permanent' do
    subject[:permanent] = 'yes'
    subject[:permanent].should == :true
  end
  it 'should accept true as a value for permanent' do
    subject[:permanent] = :true
    subject[:permanent].should == :true
  end
  it 'should accept no as a value for permanent' do
    subject[:permanent] = 'no'
    subject[:permanent].should == :false
  end
  it 'should accept false as a value for permanent' do
    subject[:permanent] = :false
    subject[:permanent].should == :false
  end
  it 'should not accept a non yes/no answer as a value for permanent' do
    expect { subject[:permanent] = 'moo'}.to raise_error(Puppet::Error, /Invalid value/)
  end

  it 'should have a default path' do
    subject[:path].should == '/etc/sysctl.conf'
  end
  it 'should accept a fully qualified path as the target' do
    subject[:path] = '/etc/sysctl.conf.moo'
    subject[:path].should == '/etc/sysctl.conf.moo'
  end
  it 'should not accept an unqualified path as the target' do
    expect { subject[:path] = 'moo'}.to raise_error(Puppet::Error, /fully qualified path/)
  end

end
