require 'spec_helper_acceptance'
require 'spec_helper_faraday'
require 'json'

describe 'hiera' do
  let :base_manifest do
    <<-EOS
      class { 'elasticsearch':
        manage_repo => true,
        repo_version => '#{test_settings['repo_version']}',
        java_install => true
      }
    EOS
  end

  describe 'single instance' do
    describe 'manifest' do
      before :all do write_hiera_config(['singleinstance']) end

      it 'applies cleanly ' do
        apply_manifest base_manifest, :catch_failures => true
      end
      it 'is idempotent' do
        apply_manifest base_manifest, :catch_changes  => true
      end
    end

    describe service(test_settings['service_name_a']) do
      it { should be_enabled }
      it { should be_running }
    end

    describe file(test_settings['pid_file_a']) do
      it { should be_file }
      its(:content) { should match(/[0-9]+/) }
    end

    describe file('/etc/elasticsearch/es-01/elasticsearch.yml') do
      it { should be_file }
      it { should contain 'name: es-01' }
    end

    describe port(test_settings['port_a']) do
      it 'open', :with_retries do should be_listening end
    end

    describe server :container do
      describe http(
        "http://localhost:#{test_settings['port_a']}",
        :faraday_middleware => middleware
      ) do
        it 'serves requests' do
          expect(response.status).to eq(200)
        end
      end
    end
  end

  describe 'single instance with plugin' do
    describe 'manifest' do
      before :all do write_hiera_config(['singleplugin']) end

      it 'applies cleanly ' do
        apply_manifest base_manifest, :catch_failures => true
      end
      it 'is idempotent' do
        apply_manifest base_manifest, :catch_changes  => true
      end
    end

    describe file('/usr/share/elasticsearch/plugins/head/') do
      it { should be_directory }
    end

    describe port(test_settings['port_a']) do
      it 'open', :with_retries do should be_listening end
    end

    describe server :container do
      describe http(
        "http://localhost:#{test_settings['port_a']}/_cluster/stats",
        :faraday_middleware => middleware
      ) do
        it 'reports the plugin as installed', :with_retries do
          plugins = JSON.parse(response.body)['nodes']['plugins'].map do |h|
            h['name']
          end
          expect(plugins).to include('head')
        end
      end
    end
  end

  describe 'multiple instances' do
    describe 'manifest' do
      before :all do write_hiera_config(['multipleinstances']) end

      it 'applies cleanly ' do
        apply_manifest base_manifest, :catch_failures => true
      end
      it 'is idempotent' do
        apply_manifest base_manifest, :catch_changes  => true
      end
    end

    describe service(test_settings['service_name_a']) do
      it { should be_enabled }
      it { should be_running }
    end

    describe service(test_settings['service_name_b']) do
      it { should be_enabled }
      it { should be_running }
    end

    describe file('/etc/elasticsearch/es-01/elasticsearch.yml') do
      it { should be_file }
      it { should contain 'name: es-01' }
    end

    describe file('/etc/elasticsearch/es-02/elasticsearch.yml') do
      it { should be_file }
      it { should contain 'name: es-02' }
    end

    describe port(test_settings['port_a']) do
      it 'open', :with_retries do should be_listening end
    end

    describe server :container do
      describe http(
        "http://localhost:#{test_settings['port_a']}",
        :faraday_middleware => middleware
      ) do
        it 'serves requests' do
          expect(response.status).to eq(200)
        end
      end
    end

    describe port(test_settings['port_b']) do
      it 'open', :with_retries do should be_listening end
    end

    describe server :container do
      describe http(
        "http://localhost:#{test_settings['port_b']}",
        :faraday_middleware => middleware
      ) do
        it 'serves requests' do
          expect(response.status).to eq(200)
        end
      end
    end
  end

  after :all do
    write_hiera_config([])

    apply_manifest <<-EOS
      class { 'elasticsearch': ensure => 'absent' }
      elasticsearch::instance { 'es-01': ensure => 'absent' }
      elasticsearch::instance { 'es-02': ensure => 'absent' }
    EOS
  end
end
