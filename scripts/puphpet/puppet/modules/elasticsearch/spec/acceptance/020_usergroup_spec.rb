require 'spec_helper_acceptance'

describe 'elasticsearch::elasticsearch_user' do
  describe 'changing service user', :with_cleanup do
    describe 'manifest' do
      before :all do
        shell 'rm -rf /usr/share/elasticsearch'
      end

      pp = <<-EOS
        user { 'esuser':
          ensure => 'present',
          groups => ['esgroup', 'esuser']
        }
        group { 'esuser': ensure => 'present' }
        group { 'esgroup': ensure => 'present' }

        class { 'elasticsearch':
          config => {
            'cluster.name' => '#{test_settings['cluster_name']}'
          },
          manage_repo => true,
          repo_version => '#{test_settings['repo_version']}',
          java_install => true,
          elasticsearch_user => 'esuser',
          elasticsearch_group => 'esgroup'
        }

        elasticsearch::instance { 'es-01':
          config => {
            'node.name' => 'elasticsearch001',
            'http.port' => '#{test_settings['port_a']}'
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

    describe file('/etc/elasticsearch/es-01/elasticsearch.yml') do
      it { should be_file }
      it { should be_owned_by 'esuser' }
      it { should contain 'name: elasticsearch001' }
    end

    describe file('/usr/share/elasticsearch') do
      it { should be_directory }
      it { should be_owned_by 'esuser' }
    end

    describe file('/var/log/elasticsearch') do
      it { should be_directory }
      it { should be_owned_by 'esuser' }
    end

    describe file('/etc/elasticsearch') do
      it { should be_directory }
      it { should be_owned_by 'esuser' }
    end

    describe port(test_settings['port_a']) do
      it 'open', :with_retries do should be_listening end
    end

    describe server :container do
      describe http(
        "http://localhost:#{test_settings['port_a']}",
      ) do
        describe 'instance a' do
          it 'serves requests', :with_retries do
            expect(response.status).to eq(200)
          end
        end
      end
    end
  end

  after :all do
    shell 'rm -rf /usr/share/elasticsearch'
  end
end
