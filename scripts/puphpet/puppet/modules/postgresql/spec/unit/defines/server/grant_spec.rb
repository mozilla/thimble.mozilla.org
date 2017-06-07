require 'spec_helper'

describe 'postgresql::server::grant', :type => :define do
  let :facts do
    {
      :osfamily => 'Debian',
      :operatingsystem => 'Debian',
      :operatingsystemrelease => '6.0',
      :kernel => 'Linux',
      :concat_basedir => tmpfilename('contrib'),
      :id => 'root',
      :path => '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
    }
  end

  let :title do
    'test'
  end

  context 'plain' do
    let :params do
      {
        :db => 'test',
        :role => 'test',
      }
    end

    let :pre_condition do
      "class {'postgresql::server':}"
    end

    it { is_expected.to contain_postgresql__server__grant('test') }
  end

  context 'sequence' do
    let :params do
      {
        :db => 'test',
        :role => 'test',
        :privilege => 'usage',
        :object_type => 'sequence',
      }
    end

    let :pre_condition do
      "class {'postgresql::server':}"
    end

    it { is_expected.to contain_postgresql__server__grant('test') }
    it { is_expected.to contain_postgresql_psql('grant:test').with(
                          {
                            'command' => "GRANT USAGE ON SEQUENCE \"test\" TO\n      \"test\"",
                            'unless' => "SELECT 1 WHERE has_sequence_privilege('test',\n                  'test', 'USAGE')",
                          }) }
  end

  context 'all sequences' do
    let :params do
      {
        :db => 'test',
        :role => 'test',
        :privilege => 'usage',
        :object_type => 'all sequences in schema',
        :object_name => 'public',
      }
    end

    let :pre_condition do
      "class {'postgresql::server':}"
    end

    it { is_expected.to contain_postgresql__server__grant('test') }
    it { is_expected.to contain_postgresql_psql('grant:test').with(
                          {
                            'command' => "GRANT USAGE ON ALL SEQUENCES IN SCHEMA \"public\" TO\n      \"test\"",
                            'unless' => "SELECT 1 FROM (\n        SELECT sequence_name\n        FROM information_schema.sequences\n        WHERE sequence_schema='public'\n          EXCEPT DISTINCT\n        SELECT object_name as sequence_name\n        FROM information_schema.role_usage_grants\n        WHERE object_type='SEQUENCE'\n        AND grantee='test'\n        AND object_schema='public'\n        AND privilege_type='USAGE'\n        ) P\n        HAVING count(P.sequence_name) = 0",
                          }) }
  end

  context "with specific db connection settings - default port" do
    let :params do
      {
        :db => 'test',
        :role => 'test',
        :connect_settings => { 'PGHOST'    => 'postgres-db-server',
                               'DBVERSION' => '9.1', },
      }
    end

    let :pre_condition do
      "class {'postgresql::server':}"
    end

    it { is_expected.to contain_postgresql__server__grant('test') }
    it { is_expected.to contain_postgresql_psql("grant:test").with_connect_settings( { 'PGHOST'    => 'postgres-db-server','DBVERSION' => '9.1' } ).with_port( 5432 ) }
  end

  context "with specific db connection settings - including port" do
    let :params do
      {
        :db => 'test',
        :role => 'test',
        :connect_settings => { 'PGHOST'    => 'postgres-db-server',
                               'DBVERSION' => '9.1',
                               'PGPORT'    => '1234', },
      }
    end

    let :pre_condition do
      "class {'postgresql::server':}"
    end

    it { is_expected.to contain_postgresql__server__grant('test') }
    it { is_expected.to contain_postgresql_psql("grant:test").with_connect_settings( { 'PGHOST'    => 'postgres-db-server','DBVERSION' => '9.1','PGPORT'    => '1234' } ) }
  end

  context "with specific db connection settings - port overriden by explicit parameter" do
    let :params do
      {
        :db => 'test',
        :role => 'test',
        :connect_settings => { 'PGHOST'    => 'postgres-db-server',
                               'DBVERSION' => '9.1',
             'PGPORT'    => '1234', },
        :port => '5678',
      }
    end

    let :pre_condition do
      "class {'postgresql::server':}"
    end

    it { is_expected.to contain_postgresql__server__grant('test') }
    it { is_expected.to contain_postgresql_psql("grant:test").with_connect_settings( { 'PGHOST'    => 'postgres-db-server','DBVERSION' => '9.1','PGPORT'    => '1234' } ).with_port( '5678' ) }
  end
end