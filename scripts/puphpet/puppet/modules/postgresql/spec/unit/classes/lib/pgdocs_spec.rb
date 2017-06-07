require 'spec_helper'

describe 'postgresql::lib::docs', :type => :class do

  describe 'on a redhat based os' do
    let :facts do {
      :osfamily => 'RedHat',
      :operatingsystem => 'RedHat',
      :operatingsystemrelease => '6.4',
    }
    end
    it { is_expected.to contain_package('postgresql-docs').with(
      :name => 'postgresql-docs',
      :ensure => 'present',
      :tag    => 'postgresql'
    )}
    describe 'when parameters are supplied' do
      let :params do
        {:package_ensure => 'latest', :package_name => 'somepackage'}
      end
      it { is_expected.to contain_package('postgresql-docs').with(
        :name => 'somepackage',
        :ensure => 'latest',
        :tag    => 'postgresql'
      )}
    end
  end

end
