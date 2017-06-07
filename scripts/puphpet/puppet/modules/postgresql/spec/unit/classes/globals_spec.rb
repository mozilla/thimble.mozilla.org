require 'spec_helper'

describe 'postgresql::globals', :type => :class do
  context "on a debian 6" do
    let (:facts) do
      {
        :osfamily               => 'Debian',
        :operatingsystem        => 'Debian',
        :operatingsystemrelease => '6.0',
        :lsbdistid              => 'Debian',
        :lsbdistcodename        => 'squeeze',
      }
    end

    describe 'with no parameters' do
      it 'should work' do
        is_expected.to contain_class("postgresql::globals")
      end
    end

    describe 'manage_package_repo => true' do
      let(:params) do
        {
          :manage_package_repo => true,
        }
      end
      it 'should pull in class postgresql::repo' do
        is_expected.to contain_class("postgresql::repo")
      end
    end
  end

  context 'on redhat family systems' do
    let (:facts) do
      {
        :osfamily                  => 'RedHat',
        :operatingsystem           => 'RedHat',
        :operatingsystemrelease    => '7.1',
      }
    end
    describe 'with no parameters' do
      it 'should work' do
        is_expected.to contain_class("postgresql::globals")
      end
    end
    
    describe 'manage_package_repo on RHEL => true' do
      let(:params) do
        {
          :manage_package_repo => true,
          :repo_proxy          => 'http://proxy-server:8080',
        }
      end
      
      it 'should pull in class postgresql::repo' do
        is_expected.to contain_class("postgresql::repo")
      end

      it do
        should contain_yumrepo('yum.postgresql.org').with(
          'enabled' => '1',
          'proxy'   => 'http://proxy-server:8080'
          )
      end
    end
  end
end
