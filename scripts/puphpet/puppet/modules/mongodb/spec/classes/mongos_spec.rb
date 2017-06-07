require 'spec_helper'

describe 'mongodb::mongos' do
  with_debian_facts

  let :params do
    {
      :configdb => ['127.0.0.1:27019']
    }
  end

  context 'with defaults' do
    it { is_expected.to contain_class('mongodb::mongos::install') }
    it { is_expected.to contain_class('mongodb::mongos::config') }
    it { is_expected.to contain_class('mongodb::mongos::service') }
  end

  context 'when deploying on Solaris' do
    let :facts do
      { :osfamily        => 'Solaris' }
    end
    it { expect { is_expected.to raise_error(Puppet::Error) } }
  end

end
