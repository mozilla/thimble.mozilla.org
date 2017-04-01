require 'spec_helper'

describe 'elasticsearch::shield::user' do

  let :facts do {
    :operatingsystem => 'CentOS',
    :kernel => 'Linux',
    :osfamily => 'RedHat',
    :operatingsystemmajrelease => '7',
    :scenario => '',
    :common => ''
  } end

  let(:title) { 'elastic' }

  let(:pre_condition) {%q{
    class { 'elasticsearch': }
  }}

  context 'with default parameters' do

    let(:params) do
      {
        :password => 'foobar',
        :roles => ['monitor', 'user']
      }
    end

    it { should contain_elasticsearch__shield__user('elastic') }
    it { should contain_elasticsearch_shield_user('elastic') }
    it do
      should contain_elasticsearch_shield_user_roles('elastic').with(
        'ensure' => 'present',
        'roles'  => ['monitor', 'user']
      )
    end
  end

  describe 'collector ordering' do
    describe 'when present' do
      let(:pre_condition) {%q{
        class { 'elasticsearch': }
        elasticsearch::instance { 'es-01': }
        elasticsearch::plugin { 'shield': instances => 'es-01' }
        elasticsearch::template { 'foo': content => {"foo" => "bar"} }
        elasticsearch::shield::role { 'test_role':
          privileges => {
            'cluster' => 'monitor',
            'indices' => {
              '*' => 'all',
            },
          },
        }
      }}

      let(:params) {{
        :password => 'foobar',
        :roles => ['monitor', 'user']
      }}

      it { should contain_elasticsearch__shield__role('test_role') }
      it { should contain_elasticsearch_shield_role('test_role') }
      it { should contain_elasticsearch_shield_role_mapping('test_role') }
      it { should contain_elasticsearch__plugin('shield') }
      it { should contain_elasticsearch_plugin('shield') }
      it { should contain_file(
        '/usr/share/elasticsearch/plugins/shield'
      ) }
      it { should contain_elasticsearch__shield__user('elastic')
        .that_comes_before([
        'Elasticsearch::Template[foo]'
      ]).that_requires([
        'Elasticsearch::Plugin[shield]',
        'Elasticsearch::Shield::Role[test_role]'
      ])}
    end

    describe 'when absent' do
      let(:pre_condition) {%q{
        class { 'elasticsearch': }
        elasticsearch::instance { 'es-01': }
        elasticsearch::plugin { 'shield':
          ensure => 'absent',
          instances => 'es-01',
        }
        elasticsearch::template { 'foo': content => {"foo" => "bar"} }
        elasticsearch::shield::role { 'test_role':
          privileges => {
            'cluster' => 'monitor',
            'indices' => {
              '*' => 'all',
            },
          },
        }
      }}

      let(:params) {{
        :password => 'foobar',
        :roles => ['monitor', 'user']
      }}

      it { should contain_elasticsearch__shield__role('test_role') }
      it { should contain_elasticsearch_shield_role('test_role') }
      it { should contain_elasticsearch_shield_role_mapping('test_role') }
      it { should contain_elasticsearch__plugin('shield') }
      it { should contain_elasticsearch_plugin('shield') }
      it { should contain_file(
        '/usr/share/elasticsearch/plugins/shield'
      ) }
      it { should contain_elasticsearch__shield__user('elastic')
        .that_comes_before([
        'Elasticsearch::Template[foo]',
        'Elasticsearch::Plugin[shield]'
      ]).that_requires([
        'Elasticsearch::Shield::Role[test_role]'
      ])}
    end
  end
end
