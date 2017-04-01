require 'spec_helper'

describe 'mongodb::repo', :type => :class do

  context 'when deploying on Debian' do
    with_debian_facts

    it {
      is_expected.to contain_class('mongodb::repo::apt')
    }
  end

  context 'when deploying on CentOS' do
    with_centos_facts

    it {
      is_expected.to contain_class('mongodb::repo::yum')
    }
  end

  context 'when yumrepo has a proxy set' do
    with_redhat_facts

    let :params do
      {
        :proxy => 'http://proxy-server:8080',
        :proxy_username => 'proxyuser1',
        :proxy_password => 'proxypassword1',
      }
    end
    it {
      is_expected.to contain_class('mongodb::repo::yum')
    }
    it do
      should contain_yumrepo('mongodb').with({
        'enabled' => '1',
        'proxy' => 'http://proxy-server:8080',
        'proxy_username' => 'proxyuser1',
        'proxy_password' => 'proxypassword1',
        })
    end
  end
end
