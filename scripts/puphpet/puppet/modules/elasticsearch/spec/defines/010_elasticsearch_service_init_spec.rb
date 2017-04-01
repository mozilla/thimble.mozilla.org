require 'spec_helper'

describe 'elasticsearch::service::init', :type => 'define' do

  let :facts do {
    :operatingsystem => 'CentOS',
    :kernel => 'Linux',
    :osfamily => 'RedHat',
    :operatingsystemmajrelease => '6',
    :scenario => '',
    :common => ''
  } end

  let(:title) { 'es-01' }
  let(:pre_condition) { 'class {"elasticsearch": config => { "node" => {"name" => "test" }}}' }

  context "Setup service" do

    let :params do {
      :ensure => 'present',
      :status => 'enabled'
    } end

    it { should contain_elasticsearch__service__init('es-01') }
    it { should contain_service('elasticsearch-instance-es-01').with(:ensure => 'running', :enable => true) }
  end

  context "Remove service" do

    let :params do {
      :ensure => 'absent'
    } end

    it { should contain_elasticsearch__service__init('es-01') }
    it { should contain_service('elasticsearch-instance-es-01').with(:ensure => 'stopped', :enable => false) }
  end

  context "unmanaged" do
      let :params do {
        :ensure => 'present',
	:status => 'unmanaged'
      } end

    it { should contain_elasticsearch__service__init('es-01') }
    it { should contain_service('elasticsearch-instance-es-01').with(:enable => false) }
    it { should contain_augeas('defaults_es-01') }

  end

  context "Defaults file" do

    context "Set via file" do
      let :params do {
        :ensure => 'present',
        :status => 'enabled',
        :init_defaults_file =>
          'puppet:///path/to/initdefaultsfile'
      } end

      it { should contain_file(
        '/etc/sysconfig/elasticsearch-es-01'
      ).with(
        :source => 'puppet:///path/to/initdefaultsfile'
      )}
      it { should contain_file(
        '/etc/sysconfig/elasticsearch-es-01'
      ).that_comes_before(
        'Service[elasticsearch-instance-es-01]'
      ) }
    end

    context "Set via hash" do
      let :params do {
        :ensure => 'present',
        :status => 'enabled',
        :init_defaults => {'ES_HOME' => '/usr/share/elasticsearch' }
      } end

      it 'writes the defaults file' do
        should contain_augeas('defaults_es-01').with(
          :incl => '/etc/sysconfig/elasticsearch-es-01',
          :changes => [
            "set ES_GROUP 'elasticsearch'",
            "set ES_HOME '/usr/share/elasticsearch'",
            "set ES_USER 'elasticsearch'",
            "set MAX_OPEN_FILES '65535'",
          ].join("\n") << "\n",
          :before => 'Service[elasticsearch-instance-es-01]'
        )
      end
    end

    context 'restarts when "restart_on_change" is true' do
      let(:pre_condition) { %q{
        class { "elasticsearch":
          config => { "node" => {"name" => "test" }},
          restart_on_change => true
        }
      }}

      context "Set via file" do
        let :params do {
          :ensure => 'present',
          :status => 'enabled',
          :init_defaults_file => 'puppet:///path/to/initdefaultsfile'
        } end

        it { should contain_file(
          '/etc/sysconfig/elasticsearch-es-01'
        ).with(
          :source => 'puppet:///path/to/initdefaultsfile'
        ) }
        it { should contain_file(
          '/etc/sysconfig/elasticsearch-es-01'
        ).that_comes_before(
          'Service[elasticsearch-instance-es-01]'
        ) }
        it { should contain_file(
          '/etc/sysconfig/elasticsearch-es-01'
        ).that_notifies(
          'Service[elasticsearch-instance-es-01]'
        ) }
      end

      context "Set via hash" do
        let :params do {
          :ensure => 'present',
          :status => 'enabled',
          :init_defaults => {
            'ES_HOME' => '/usr/share/elasticsearch'
          }
        } end

        it { should contain_augeas(
          'defaults_es-01'
        ).with(
          :incl => '/etc/sysconfig/elasticsearch-es-01',
          :changes => "set ES_GROUP 'elasticsearch'\nset ES_HOME '/usr/share/elasticsearch'\nset ES_USER 'elasticsearch'\nset MAX_OPEN_FILES '65535'\n"
        ) }
        it { should contain_augeas(
          'defaults_es-01'
        ).that_comes_before(
          'Service[elasticsearch-instance-es-01]'
        ) }
        it { should contain_augeas(
          'defaults_es-01'
        ).that_notifies(
          'Service[elasticsearch-instance-es-01]'
        ) }
      end
    end

    context 'does not restart when "restart_on_change" is false' do
      let(:pre_condition) { %q{
        class { "elasticsearch":
          config => { "node" => {"name" => "test" }},
        }
      }}

      context "Set via file" do
        let :params do {
          :ensure => 'present',
          :status => 'enabled',
          :init_defaults_file => 'puppet:///path/to/initdefaultsfile'
        } end

        it { should_not contain_file(
          '/etc/sysconfig/elasticsearch-es-01'
        ).that_notifies(
          'Service[elasticsearch-instance-es-01]'
        ) }
      end

      context "Set via hash" do
        let :params do {
          :ensure => 'present',
          :status => 'enabled',
          :init_defaults => {
            'ES_HOME' => '/usr/share/elasticsearch'
          }
        } end

        it { should_not contain_augeas(
          'defaults_es-01'
        ).that_notifies(
          'Service[elasticsearch-instance-es-01]'
        ) }
      end
    end
  end

  context "Init file" do
    let(:pre_condition) { 'class {"elasticsearch": config => { "node" => {"name" => "test" }} } ' }

    context "Via template" do
      let :params do {
        :ensure => 'present',
        :status => 'enabled',
        :init_template =>
          'elasticsearch/etc/init.d/elasticsearch.RedHat.erb'
      } end

      it { should contain_file(
        '/etc/init.d/elasticsearch-es-01'
      ).that_comes_before('Service[elasticsearch-instance-es-01]') }
    end

    context 'restarts when "restart_on_change" is true' do
      let(:pre_condition) { %q{
        class { "elasticsearch":
          config => { "node" => {"name" => "test" }},
          restart_on_change => true
        }
      }}

      let :params do {
        :ensure => 'present',
        :status => 'enabled',
        :init_template =>
          'elasticsearch/etc/init.d/elasticsearch.RedHat.erb'
      } end

      it { should contain_file(
        '/etc/init.d/elasticsearch-es-01'
      ).that_comes_before(
        'Service[elasticsearch-instance-es-01]'
      ) }
      it { should contain_file(
        '/etc/init.d/elasticsearch-es-01'
      ).that_notifies(
        'Service[elasticsearch-instance-es-01]'
      ) }
    end

    context 'does not restart when "restart_on_change" is false' do
      let(:pre_condition) { %q{
        class { "elasticsearch":
          config => { "node" => {"name" => "test" }},
        }
      }}

      let :params do {
        :ensure => 'present',
        :status => 'enabled',
        :init_template =>
          'elasticsearch/etc/init.d/elasticsearch.RedHat.erb'
      } end

      it { should_not contain_file(
        '/etc/init.d/elasticsearch-es-01'
      ).that_notifies(
        'Service[elasticsearch-instance-es-01]'
      ) }
    end
  end
end
