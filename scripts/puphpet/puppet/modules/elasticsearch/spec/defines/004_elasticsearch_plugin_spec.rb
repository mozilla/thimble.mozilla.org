require 'spec_helper'

describe 'elasticsearch::plugin', :type => 'define' do

  let(:title) { 'mobz/elasticsearch-head/1.0.0' }
  let :facts do {
    :operatingsystem => 'CentOS',
    :kernel => 'Linux',
    :osfamily => 'RedHat',
    :operatingsystemmajrelease => '6',
    :scenario => '',
    :common => ''
  } end

  let(:pre_condition) {%q{
    class { "elasticsearch":
      config => {
        "node" => {
          "name" => "test"
        }
      }
    }
  }}

  context 'with module_dir' do

    context "Add a plugin" do

      let :params do {
        :ensure     => 'present',
        :module_dir => 'head',
        :instances  => 'es-01'
      } end

      it { should contain_elasticsearch__plugin(
        'mobz/elasticsearch-head/1.0.0'
      ) }
      it { should contain_elasticsearch_plugin(
        'mobz/elasticsearch-head/1.0.0'
      ) }
      it { should contain_file(
        '/usr/share/elasticsearch/plugins/head'
      ).that_requires(
        'Elasticsearch_plugin[mobz/elasticsearch-head/1.0.0]'
      ) }
    end

    context "Remove a plugin" do

      let :params do {
        :ensure     => 'absent',
        :module_dir => 'head',
        :instances  => 'es-01'
      } end

      it { should contain_elasticsearch__plugin(
        'mobz/elasticsearch-head/1.0.0'
      ) }
      it { should contain_elasticsearch_plugin(
        'mobz/elasticsearch-head/1.0.0'
      ).with(
        :ensure => 'absent'
      ) }
      it { should contain_file(
        '/usr/share/elasticsearch/plugins/head'
      ).that_requires(
        'Elasticsearch_plugin[mobz/elasticsearch-head/1.0.0]'
      ) }
    end

  end

  context 'with url' do

    context "Add a plugin with full name" do

      let :params do {
        :ensure     => 'present',
        :instances  => 'es-01',
        :url        => 'https://github.com/mobz/elasticsearch-head/archive/master.zip',
      } end

      it { should contain_elasticsearch__plugin('mobz/elasticsearch-head/1.0.0') }
      it { should contain_elasticsearch_plugin('mobz/elasticsearch-head/1.0.0').with(:ensure => 'present', :url => 'https://github.com/mobz/elasticsearch-head/archive/master.zip') }
    end

  end

  context "offline plugin install" do

      let(:title) { 'head' }
      let :params do {
        :ensure     => 'present',
        :instances  => 'es-01',
        :source     => 'puppet:///path/to/my/plugin.zip',
      } end

      it { should contain_elasticsearch__plugin('head') }
      it { should contain_file('/opt/elasticsearch/swdl/plugin.zip').with(:source => 'puppet:///path/to/my/plugin.zip', :before => 'Elasticsearch_plugin[head]') }
      it { should contain_elasticsearch_plugin('head').with(:ensure => 'present', :source => '/opt/elasticsearch/swdl/plugin.zip') }

  end

  describe 'service restarts' do

    let(:title) { 'head' }
    let :params do {
      :ensure     => 'present',
      :instances  => 'es-01',
      :module_dir => 'head',
    } end

    context 'restart_on_change set to false (default)' do
      let(:pre_condition) { %q{
        class { "elasticsearch": }

        elasticsearch::instance { 'es-01': }
      }}

      it { should_not contain_elasticsearch_plugin(
        'head'
      ).that_notifies(
        'Elasticsearch::Service[es-01]'
      )}
    end

    context 'restart_on_change set to true' do
      let(:pre_condition) { %q{
        class { "elasticsearch":
          restart_on_change => true,
        }

        elasticsearch::instance { 'es-01': }
      }}

      it { should contain_elasticsearch_plugin(
        'head'
      ).that_notifies(
        'Elasticsearch::Service[es-01]'
      )}
    end

    context 'restart_plugin_change set to false (default)' do
      let(:pre_condition) { %q{
        class { "elasticsearch":
          restart_plugin_change => false,
        }

        elasticsearch::instance { 'es-01': }
      }}

      it { should_not contain_elasticsearch_plugin(
        'head'
      ).that_notifies(
        'Elasticsearch::Service[es-01]'
      )}
    end

    context 'restart_plugin_change set to true' do
      let(:pre_condition) { %q{
        class { "elasticsearch":
          restart_plugin_change => true,
        }

        elasticsearch::instance { 'es-01': }
      }}

      it { should contain_elasticsearch_plugin(
        'head'
      ).that_notifies(
        'Elasticsearch::Service[es-01]'
      )}
    end

  end

  describe 'proxy arguments' do

    let(:title) { 'head' }

    context 'unauthenticated' do
      context 'on define' do
        let :params do {
          :ensure         => 'present',
          :instances      => 'es-01',
          :proxy_host     => 'es.local',
          :proxy_port     => '8080'
        } end

        it { should contain_elasticsearch_plugin(
          'head'
        ).with_proxy(
          'http://es.local:8080'
        )}
      end

      context 'on main class' do
        let :params do {
          :ensure    => 'present',
          :instances => 'es-01'
        } end

        let(:pre_condition) { %q{
          class { 'elasticsearch':
            proxy_url => 'https://es.local:8080',
          }
        }}

        it { should contain_elasticsearch_plugin(
          'head'
        ).with_proxy(
          'https://es.local:8080'
        )}
      end
    end

    context 'authenticated' do
      context 'on define' do
        let :params do {
          :ensure         => 'present',
          :instances      => 'es-01',
          :proxy_host     => 'es.local',
          :proxy_port     => '8080',
          :proxy_username => 'elastic',
          :proxy_password => 'password'
        } end

        it { should contain_elasticsearch_plugin(
          'head'
        ).with_proxy(
          'http://elastic:password@es.local:8080'
        )}
      end

      context 'on main class' do
        let :params do {
          :ensure    => 'present',
          :instances => 'es-01'
        } end

        let(:pre_condition) { %q{
          class { 'elasticsearch':
            proxy_url => 'http://elastic:password@es.local:8080',
          }
        }}

        it { should contain_elasticsearch_plugin(
          'head'
        ).with_proxy(
          'http://elastic:password@es.local:8080'
        )}
      end
    end

  end

  describe 'collector ordering' do
    describe 'present' do
      let(:title) { 'head' }
      let(:pre_condition) {%q{
        class { 'elasticsearch': }
        elasticsearch::instance { 'es-01': }
      }}
      let :params do {
        :instances => 'es-01'
      } end

      it { should contain_elasticsearch__plugin(
        'head'
      ).that_comes_before(
        'Elasticsearch::Instance[es-01]'
      )}
    end
  end
end
