require 'spec_helper'

describe 'elasticsearch', :type => 'class' do

  default_params = {
    :config  => { 'node.name' => 'foo' }
  }

  facts = {
    :operatingsystem => 'CentOS',
    :kernel => 'Linux',
    :osfamily => 'RedHat',
    :operatingsystemmajrelease => '6'
  }

  let (:params) do
    default_params.merge({ })
  end

  context "Hiera" do
  
    context 'when specifying instances to create' do

      context 'a single instance' do

        let (:facts) {
          facts.merge({
            :scenario => 'singleinstance',
            :common => ''
          })
        }

        it { should contain_elasticsearch__instance('es-01').with(:config => { 'node.name' => 'es-01' }) }
        it { should contain_elasticsearch__service('es-01') }
        it { should contain_elasticsearch__service__init('es-01') }
        it { should contain_service('elasticsearch-instance-es-01') }
        it { should contain_augeas('defaults_es-01') }
        it { should contain_file('/etc/elasticsearch/es-01').with(:ensure => 'directory') }
        it { should contain_file('/etc/elasticsearch/es-01/elasticsearch.yml') }
        it { should contain_file('/etc/elasticsearch/es-01/logging.yml') }
        it { should contain_exec('mkdir_datadir_elasticsearch_es-01').with(:command => 'mkdir -p /usr/share/elasticsearch/data/es-01') }
        it { should contain_file('/usr/share/elasticsearch/data/es-01') }
        it { should contain_file('/etc/init.d/elasticsearch-es-01') }
        it { should contain_file('/etc/elasticsearch/es-01/scripts').with(:target => '/usr/share/elasticsearch/scripts') }
        it { should contain_datacat_fragment('main_config_es-01') }
        it { should contain_datacat('/etc/elasticsearch/es-01/elasticsearch.yml') }

      end

      context 'multiple instances' do

        let (:facts) {
          facts.merge({
            :scenario => 'multipleinstances',
            :common => ''
          })
        }

        it { should contain_elasticsearch__instance('es-01').with(:config => { 'node.name' => 'es-01' }) }
        it { should contain_elasticsearch__service('es-01') }
        it { should contain_elasticsearch__service__init('es-01') }
        it { should contain_service('elasticsearch-instance-es-01') }
        it { should contain_augeas('defaults_es-01') }
        it { should contain_exec('mkdir_configdir_elasticsearch_es-01') }
        it { should contain_file('/etc/elasticsearch/es-01').with(:ensure => 'directory') }
        it { should contain_file('/etc/elasticsearch/es-01/elasticsearch.yml') }
        it { should contain_file('/etc/elasticsearch/es-01/logging.yml') }
        it { should contain_exec('mkdir_datadir_elasticsearch_es-01') }
        it { should contain_file('/usr/share/elasticsearch/data/es-01') }
        it { should contain_file('/var/log/elasticsearch/es-01') }
        it { should contain_file('/etc/init.d/elasticsearch-es-01') }
        it { should contain_file('/etc/elasticsearch/es-01/scripts').with(:target => '/usr/share/elasticsearch/scripts') }
        it { should contain_datacat_fragment('main_config_es-01') }
        it { should contain_datacat('/etc/elasticsearch/es-01/elasticsearch.yml') }


        it { should contain_elasticsearch__instance('es-02').with(:config => { 'node.name' => 'es-02' }) }
        it { should contain_elasticsearch__service('es-02') }
        it { should contain_elasticsearch__service__init('es-02') }
        it { should contain_service('elasticsearch-instance-es-02') }
        it { should contain_augeas('defaults_es-02') }
        it { should contain_exec('mkdir_configdir_elasticsearch_es-02') }
        it { should contain_file('/etc/elasticsearch/es-02').with(:ensure => 'directory') }
        it { should contain_file('/etc/elasticsearch/es-02/elasticsearch.yml') }
        it { should contain_file('/etc/elasticsearch/es-02/logging.yml') }
        it { should contain_exec('mkdir_datadir_elasticsearch_es-02') }
        it { should contain_file('/usr/share/elasticsearch/data/es-02') }
        it { should contain_file('/var/log/elasticsearch/es-02') }
        it { should contain_file('/etc/init.d/elasticsearch-es-02') }
        it { should contain_file('/etc/elasticsearch/es-02/scripts').with(:target => '/usr/share/elasticsearch/scripts') }
        it { should contain_file('/etc/elasticsearch/es-02/shield') }
        it { should contain_datacat_fragment('main_config_es-02') }
        it { should contain_datacat('/etc/elasticsearch/es-02/elasticsearch.yml') }


      end

    end

    context 'when we haven\'t specfied any instances to create' do

      let (:facts) {
        facts.merge({
          :scenario => '',
          :common => ''
        })
      }

      it { should_not contain_elasticsearch__instance('es-01') }
      it { should_not contain_elasticsearch__instance('es-02') }

    end

    # Hiera Plugin creation.

    context 'when specifying plugins to create' do

      let (:facts) {
        facts.merge({
          :scenario => 'singleplugin',
          :common => ''
        })
      }

      it { should contain_elasticsearch__plugin('mobz/elasticsearch-head/1.0.0').with(:ensure => 'present', :module_dir => 'head', :instances => ['es-01'] ) }
      it { should contain_elasticsearch_plugin('mobz/elasticsearch-head/1.0.0') }

    end

    context 'when we haven\'t specified any plugins to create' do

      let (:facts) {
        facts.merge({
          :scenario => '',
          :common => ''
        })
      }

      it { should_not contain_elasticsearch__plugin(
        'mobz/elasticsearch-head/1.0.0'
      ) }

    end

    context "multiple instances using hiera_merge" do

      let (:params) {
        default_params.merge({
        :instances_hiera_merge => true
        })
      }

      let (:facts) {
        facts.merge({
          :common => 'defaultinstance',
          :scenario => 'singleinstance'
        })
      }

      it { should contain_elasticsearch__instance('default').with(:config => { 'node.name' => 'default' }) }
      it { should contain_elasticsearch__service('default') }
      it { should contain_elasticsearch__service__init('default') }
      it { should contain_service('elasticsearch-instance-default') }
      it { should contain_augeas('defaults_default') }
      it { should contain_exec('mkdir_configdir_elasticsearch_default') }
      it { should contain_file('/etc/elasticsearch/default').with(:ensure => 'directory') }
      it { should contain_file('/etc/elasticsearch/default/elasticsearch.yml') }
      it { should contain_file('/etc/elasticsearch/default/logging.yml') }
      it { should contain_exec('mkdir_datadir_elasticsearch_default') }
      it { should contain_file('/usr/share/elasticsearch/data/default') }
      it { should contain_file('/var/log/elasticsearch/default') }
      it { should contain_file('/etc/init.d/elasticsearch-default') }
      it { should contain_file('/etc/elasticsearch/default/scripts').with(:target => '/usr/share/elasticsearch/scripts') }
      it { should contain_file('/etc/elasticsearch/default/shield') }
      it { should contain_datacat_fragment('main_config_default') }
      it { should contain_datacat('/etc/elasticsearch/default/elasticsearch.yml') }


      it { should contain_elasticsearch__instance('es-01').with(:config => { 'node.name' => 'es-01' }) }
      it { should contain_elasticsearch__service('es-01') }
      it { should contain_elasticsearch__service__init('es-01') }
      it { should contain_service('elasticsearch-instance-es-01') }
      it { should contain_augeas('defaults_es-01') }
      it { should contain_exec('mkdir_configdir_elasticsearch_es-01') }
      it { should contain_file('/etc/elasticsearch/es-01').with(:ensure => 'directory') }
      it { should contain_file('/etc/elasticsearch/es-01/elasticsearch.yml') }
      it { should contain_file('/etc/elasticsearch/es-01/logging.yml') }
      it { should contain_exec('mkdir_datadir_elasticsearch_es-01').with(:command => 'mkdir -p /usr/share/elasticsearch/data/es-01') }
      it { should contain_file('/usr/share/elasticsearch/data/es-01') }
      it { should contain_file('/var/log/elasticsearch/es-01') }
      it { should contain_file('/etc/init.d/elasticsearch-es-01') }
      it { should contain_file('/etc/elasticsearch/es-01/scripts').with(:target => '/usr/share/elasticsearch/scripts') }
      it { should contain_datacat_fragment('main_config_es-01') }
      it { should contain_datacat('/etc/elasticsearch/es-01/elasticsearch.yml') }


    end

  end

end
