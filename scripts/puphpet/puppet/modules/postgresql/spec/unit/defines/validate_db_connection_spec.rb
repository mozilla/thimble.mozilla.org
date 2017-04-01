require 'spec_helper'

describe 'postgresql::validate_db_connection', :type => :define do
  let :facts do
    {
      :osfamily => 'Debian',
      :operatingsystem => 'Debian',
      :operatingsystemrelease => '6.0',
    }
  end

  let :title do
    'test'
  end

  describe 'should work with only default parameters' do
    it { is_expected.to contain_postgresql__validate_db_connection('test') }
  end

  describe 'should work with all parameters' do
    let :params do
      {
        :database_host => 'test',
        :database_name => 'test',
        :database_password => 'test',
        :database_username => 'test',
        :database_port => 5432,
        :run_as => 'postgresq',
        :sleep => 4,
        :tries => 30,
      }
    end
    it { is_expected.to contain_postgresql__validate_db_connection('test') }

    it 'should have proper path for validate command' do
      is_expected.to contain_exec('validate postgres connection for test@test:5432/test').with({
        :unless => %r'^/usr/local/bin/validate_postgresql_connection.sh\s+\d+'
      })
    end
  end

  describe 'should work while specifying validate_connection in postgresql::client' do

    let :params do
      {
        :database_host => 'test',
        :database_name => 'test',
        :database_password => 'test',
        :database_username => 'test',
        :database_port => 5432
      }
    end

    let :pre_condition do
      "class { 'postgresql::client': validcon_script_path => '/opt/something/validate.sh' }"
    end

    it 'should have proper path for validate command' do
      is_expected.to contain_exec('validate postgres connection for test@test:5432/test').with({
        :unless => %r'^/opt/something/validate.sh\s+\d+'
      })
    end

  end

end
