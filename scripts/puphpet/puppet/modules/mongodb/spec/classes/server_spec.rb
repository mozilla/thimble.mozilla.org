require 'spec_helper'

describe 'mongodb::server' do
  let :facts do
    {
      :operatingsystem => 'Debian',
      :operatingsystemmajrelease => 8,
      :osfamily        => 'Debian',
      :root_home       => '/root',
    }
  end

  context 'with defaults' do
    it { is_expected.to compile.with_all_deps }
    it { is_expected.to contain_class('mongodb::server::install').
        that_comes_before('Class[mongodb::server::config]') }
    it { is_expected.to contain_class('mongodb::server::config').
        that_notifies('Class[mongodb::server::service]') }
    it { is_expected.to contain_class('mongodb::server::service') }
  end

  context 'with create_admin => true' do
    let(:params) do
      {
        :create_admin   => true,
        :admin_username => 'admin',
        :admin_password => 'password'
      }
    end
    it { is_expected.to compile.with_all_deps }
    it { is_expected.to contain_class('mongodb::server::install').
        that_comes_before('Class[mongodb::server::config]') }
    it { is_expected.to contain_class('mongodb::server::config').
        that_notifies('Class[mongodb::server::service]') }
    it { is_expected.to contain_class('mongodb::server::service') }

    it {
        is_expected.to contain_mongodb__db('admin').with({
          'user'     => 'admin',
          'password' => 'password',
          'roles'    => ["userAdmin", "readWrite", "dbAdmin", "dbAdminAnyDatabase",
                         "readAnyDatabase", "readWriteAnyDatabase", "userAdminAnyDatabase",
                         "clusterAdmin", "clusterManager", "clusterMonitor", "hostManager",
                         "root", "restore"]
        }).that_requires('Anchor[mongodb::server::end]')
      }
  end

  context 'when deploying on Solaris' do
    let :facts do
      { :osfamily        => 'Solaris' }
    end
    it { expect { is_expected.to raise_error(Puppet::Error) } }
  end

  context 'setting nohttpinterface' do
    it "isn't set when undef" do
      is_expected.to_not contain_file('/etc/mongodb.conf').with_content(/nohttpinterface/)
    end
    context "sets nohttpinterface to true when true" do
      let(:params) do
        { :nohttpinterface => true, }
      end
      it { is_expected.to contain_file('/etc/mongodb.conf').with_content(/nohttpinterface = true/) }
    end
    context "sets nohttpinterface to false when false" do
      let(:params) do
        { :nohttpinterface => false, }
      end
      it { is_expected.to contain_file('/etc/mongodb.conf').with_content(/nohttpinterface = false/) }
    end
    context "on >= 2.6" do
      let(:pre_condition) do
        "class { 'mongodb::globals': version => '2.6.6', }"
      end
      it "isn't set when undef" do
        is_expected.to_not contain_file('/etc/mongodb.conf').with_content(/net\.http\.enabled/)
      end
      context "sets net.http.enabled false when true" do
        let(:params) do
          { :nohttpinterface => true, }
        end
        it { is_expected.to contain_file('/etc/mongodb.conf').with_content(/net\.http\.enabled: false/) }
      end
      context "sets net.http.enabled true when false" do
        let(:params) do
          { :nohttpinterface => false, }
        end
        it { is_expected.to contain_file('/etc/mongodb.conf').with_content(/net\.http\.enabled: true/) }
      end
    end
  end

  context 'when setting up replicasets' do
    context 'should fail if providing both replica_sets and replset_members' do
      let(:params) do
        {
          :replset          => 'rsTest',
          :replset_members  => [
            'mongo1:27017',
            'mongo2:27017',
            'mongo3:27017'
          ],
          :replica_sets     => {}
        }
      end

      it { expect { is_expected.to raise_error(/Puppet::Error: You can provide either replset_members or replica_sets, not both/) } }
    end

    context 'should setup using replica_sets hash' do
      let(:rsConf) do
        {
          'rsTest' => {
            'members' => [
              'mongo1:27017',
              'mongo2:27017',
              'mongo3:27017',
            ],
            'arbiter' => 'mongo3:27017'
          }
        }
      end

      let(:params) do
        {
          :replset        => 'rsTest',
          :replset_config => rsConf
        }
      end

      it { is_expected.to contain_class('mongodb::replset').with_sets(rsConf) }
    end

    context 'should setup using replset_members' do
      let(:rsConf) do
        {
          'rsTest' => {
            'ensure'  => 'present',
            'members' => [
              'mongo1:27017',
              'mongo2:27017',
              'mongo3:27017'
            ]
          }
        }
      end

      let(:params) do
        {
          :replset         => 'rsTest',
          :replset_members => [
            'mongo1:27017',
            'mongo2:27017',
            'mongo3:27017'
          ]
        }
      end

      it { is_expected.to contain_class('mongodb::replset').with_sets(rsConf) }
    end
  end
end
