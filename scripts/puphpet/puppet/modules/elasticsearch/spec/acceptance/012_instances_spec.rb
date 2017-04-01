require 'spec_helper_acceptance'
require 'spec_helper_faraday'
require 'json'

describe 'elasticsearch::instance' do
  describe 'two instances' do
    describe 'manifest' do
      pp = <<-EOS
        class { 'elasticsearch':
          config => {
            'cluster.name' => '#{test_settings['cluster_name']}'
          },
          manage_repo => true,
          repo_version => '#{test_settings['repo_version']}',
          java_install => true
        }

        elasticsearch::instance { 'es-01':
          config => {
            'node.name' => 'elasticsearch001',
            'http.port' => '#{test_settings['port_a']}'
          }
        }

        elasticsearch::instance { 'es-02':
          config => {
            'node.name' => 'elasticsearch002',
            'http.port' => '#{test_settings['port_b']}'
          }
        }
      EOS

      it 'applies cleanly ' do
        apply_manifest pp, :catch_failures => true
      end
      it 'is idempotent' do
        apply_manifest pp , :catch_changes  => true
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

    describe file(test_settings['pid_file_a']) do
      it { should be_file }
      its(:content) { should match(/[0-9]+/) }
    end

    describe file(test_settings['pid_file_b']) do
      it { should be_file }
      its(:content) { should match(/[0-9]+/) }
    end

    describe file('/etc/elasticsearch/es-01/elasticsearch.yml') do
      it { should be_file }
      it { should contain 'name: elasticsearch001' }
    end

    describe file('/etc/elasticsearch/es-02/elasticsearch.yml') do
      it { should be_file }
      it { should contain 'name: elasticsearch002' }
    end

    describe file('/etc/elasticsearch/es-01/scripts') do
      it { should be_symlink }
    end

    describe file('/etc/elasticsearch/es-02/scripts') do
      it { should be_symlink }
    end

    describe port(test_settings['port_a']) do
      it 'open', :with_retries do should be_listening end
    end

    describe server :container do
      describe http(
        "http://localhost:#{test_settings['port_a']}",
        :faraday_middleware => middleware
      ) do
        it "serves requests on #{test_settings['port_a']}" do
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
        it "serves requests on #{test_settings['port_b']}" do
          expect(response.status).to eq(200)
        end
      end
    end
  end

  describe 'removing instance 2', :with_cleanup do
    describe 'manifest' do
      pp = <<-EOS
        class { 'elasticsearch':
          config => {
            'cluster.name' => '#{test_settings['cluster_name']}'},
          manage_repo => true,
          repo_version => '#{test_settings['repo_version']}',
          java_install => true
        }

        elasticsearch::instance { 'es-01':
          config => {
            'node.name' => 'elasticsearch001',
            'http.port' => '#{test_settings['port_a']}'
          }
        }

        elasticsearch::instance { 'es-02':
          ensure => 'absent'
        }
      EOS

      it 'applies cleanly ' do
        apply_manifest pp, :catch_failures => true
      end
    end

    describe file('/etc/elasticsearch/es-02') do
      it { should_not be_directory }
    end

    describe service(test_settings['service_name_b']) do
      it { should_not be_enabled }
      it { should_not be_running }
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
      it { should contain 'name: elasticsearch001' }
    end

    describe port(test_settings['port_a']) do
      it 'open', :with_retries do should be_listening end
    end

    describe server :container do
      describe http "http://localhost:#{test_settings['port_a']}" do
        it "serves requests on #{test_settings['port_a']}",
           :with_generous_retries do
          expect(response.status).to eq(200)
        end
      end
    end
  end
end
