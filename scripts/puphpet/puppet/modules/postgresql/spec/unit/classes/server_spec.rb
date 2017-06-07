require 'spec_helper'

describe 'postgresql::server', :type => :class do
  let :facts do
    {
      :osfamily => 'Debian',
      :operatingsystem => 'Debian',
      :lsbdistid => 'Debian',
      :lsbdistcodename => 'jessie',
      :operatingsystemrelease => '8.0',
      :concat_basedir => tmpfilename('server'),
      :kernel => 'Linux',
      :id => 'root',
      :path => '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
    }
  end

  describe 'with no parameters' do
    it { is_expected.to contain_class("postgresql::params") }
    it { is_expected.to contain_class("postgresql::server") }
    it { is_expected.to contain_exec('postgresql_reload').with({
      'command' => 'service postgresql reload',
    })
    }
    it 'should validate connection' do
      is_expected.to contain_postgresql__validate_db_connection('validate_service_is_running')
    end
  end

  describe 'service_ensure => running' do
    let(:params) do
      {
        :service_ensure    => 'running',
        :postgres_password => 'new-p@s$word-to-set'
      }
    end
    it { is_expected.to contain_class("postgresql::params") }
    it { is_expected.to contain_class("postgresql::server") }
    it { is_expected.to contain_class("postgresql::server::passwd") }
    it 'should validate connection' do
      is_expected.to contain_postgresql__validate_db_connection('validate_service_is_running')
    end
    it 'should set postgres password' do
      is_expected.to contain_exec('set_postgres_postgrespw').with({
        'command'     => '/usr/bin/psql -c "ALTER ROLE \"postgres\" PASSWORD ${NEWPASSWD_ESCAPED}"',
        'user'        => 'postgres',
        'environment' => [
          "PGPASSWORD=new-p@s$word-to-set",
          "PGPORT=5432",
          "NEWPASSWD_ESCAPED=$$new-p@s$word-to-set$$"
        ],
        'unless'      => "/usr/bin/psql -h localhost -p 5432 -c 'select 1' > /dev/null",
      })
    end
  end

  describe 'service_ensure => stopped' do
    let(:params) {{ :service_ensure => 'stopped' }}
    it { is_expected.to contain_class("postgresql::params") }
    it { is_expected.to contain_class("postgresql::server") }
    it 'shouldnt validate connection' do
      is_expected.not_to contain_postgresql__validate_db_connection('validate_service_is_running')
    end
  end

  describe 'service_restart_on_change => false' do
    let(:params) {{ :service_restart_on_change => false }}
    it { is_expected.to contain_class("postgresql::params") }
    it { is_expected.to contain_class("postgresql::server") }
    it { is_expected.to_not contain_Postgresql_conf('data_directory').that_notifies('Class[postgresql::server::service]')
    }
    it 'should validate connection' do
      is_expected.to contain_postgresql__validate_db_connection('validate_service_is_running')
    end
  end

  describe 'service_restart_on_change => true' do
    let(:params) {{ :service_restart_on_change => true }}
    it { is_expected.to contain_class("postgresql::params") }
    it { is_expected.to contain_class("postgresql::server") }
    it { is_expected.to contain_Postgresql_conf('data_directory').that_notifies('Class[postgresql::server::service]')
    }
    it 'should validate connection' do
      is_expected.to contain_postgresql__validate_db_connection('validate_service_is_running')
    end
  end

  describe 'service_reload => /bin/true' do
    let(:params) {{ :service_reload => '/bin/true' }}
    it { is_expected.to contain_class("postgresql::params") }
    it { is_expected.to contain_class("postgresql::server") }
    it { is_expected.to contain_exec('postgresql_reload').with({
      'command' => '/bin/true',
    })
    }
    it 'should validate connection' do
      is_expected.to contain_postgresql__validate_db_connection('validate_service_is_running')
    end
  end

  describe 'service_manage => true' do
    let(:params) {{ :service_manage => true }}
    it { is_expected.to contain_service('postgresqld') }
  end

  describe 'service_manage => false' do
    let(:params) {{ :service_manage => false }}
    it { is_expected.not_to contain_service('postgresqld') }
    it 'shouldnt validate connection' do
      is_expected.not_to contain_postgresql__validate_db_connection('validate_service_is_running')
    end
  end

  describe 'package_ensure => absent' do
    let(:params) do
      {
        :package_ensure => 'absent',
      }
    end

    it 'should remove the package' do
      is_expected.to contain_package('postgresql-server').with({
        :ensure => 'purged',
      })
    end

    it 'should still enable the service' do
      is_expected.to contain_service('postgresqld').with({
        :ensure => 'running',
      })
    end
  end

  describe 'needs_initdb => true' do
    let(:params) do
      {
        :needs_initdb => true,
      }
    end

    it 'should contain proper initdb exec' do
      is_expected.to contain_exec('postgresql_initdb')
    end
  end

  describe 'postgresql_version' do
    let(:pre_condition) do
      <<-EOS
      class { 'postgresql::globals':
        manage_package_repo => true,
        version             => '99.5',
        before              => Class['postgresql::server'],
      }
      EOS
    end
    it 'contains the correct package version' do
      is_expected.to contain_class('postgresql::repo').with_version('99.5')
    end
  end
end
