require 'spec_helper'

describe 'elasticsearch::shield::role' do

  let :facts do {
    :operatingsystem => 'CentOS',
    :kernel => 'Linux',
    :osfamily => 'RedHat',
    :operatingsystemmajrelease => '7',
    :scenario => '',
    :common => ''
  } end

  let(:title) { 'elastic_role' }

  let(:params) do
    {
      :privileges => {
        'cluster' => '*'
      },
      :mappings => [
        "cn=users,dc=example,dc=com",
        "cn=admins,dc=example,dc=com",
        "cn=John Doe,cn=other users,dc=example,dc=com"
      ]
    }
  end

  context 'with an invalid role name' do
    context 'too long' do
      let(:title) { 'A'*31 }
      it { should raise_error(Puppet::Error, /expected length/i) }
    end
  end

  context 'with default parameters' do
    it { should contain_elasticsearch__shield__role('elastic_role') }
    it { should contain_elasticsearch_shield_role('elastic_role') }
    it do
      should contain_elasticsearch_shield_role_mapping('elastic_role').with(
        'ensure' => 'present',
        'mappings' => [
          "cn=users,dc=example,dc=com",
          "cn=admins,dc=example,dc=com",
          "cn=John Doe,cn=other users,dc=example,dc=com"
        ]
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
        elasticsearch::shield::user { 'elastic':
          password => 'foobar',
          roles => ['elastic_role'],
        }
      }}

      it { should contain_elasticsearch__plugin('shield') }
      it { should contain_elasticsearch__shield__role('elastic_role')
        .that_comes_before([
        'Elasticsearch::Template[foo]',
        'Elasticsearch::Shield::User[elastic]'
      ]).that_requires([
        'Elasticsearch::Plugin[shield]'
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
        elasticsearch::shield::user { 'elastic':
          password => 'foobar',
          roles => ['elastic_role'],
        }
      }}

      it { should contain_elasticsearch__plugin('shield') }
      it { should contain_elasticsearch__shield__role('elastic_role')
        .that_comes_before([
        'Elasticsearch::Template[foo]',
        'Elasticsearch::Plugin[shield]',
        'Elasticsearch::Shield::User[elastic]'
      ])}
    end
  end
end
