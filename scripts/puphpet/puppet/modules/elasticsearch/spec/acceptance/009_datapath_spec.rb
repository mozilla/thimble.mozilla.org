require 'spec_helper_acceptance'
require 'spec_helper_faraday'
require 'json'

describe 'elasticsearch::datadir' do
  describe 'single data dir from class', :with_cleanup do
    describe 'manifest' do
      pp = <<-EOS
        class { 'elasticsearch':
          config => {
            'cluster.name' => '#{test_settings['cluster_name']}'
          },
          manage_repo => true,
          repo_version => '#{test_settings['repo_version']}',
          java_install => true,
          datadir => '/var/lib/elasticsearch-data'
        }

        elasticsearch::instance { 'es-01':
          config => {
            'node.name' => 'elasticsearch001',
            'http.port' => '#{test_settings['port_a']}'
          }
        }
      EOS

      it 'applies cleanly' do
        apply_manifest pp, :catch_failures => true
      end
      it 'is idempotent' do
        apply_manifest pp , :catch_changes  => true
      end
    end

    describe file('/etc/elasticsearch/es-01/elasticsearch.yml') do
      it { should be_file }
      it { should contain '/var/lib/elasticsearch-data/es-01' }
    end

    describe file('/var/lib/elasticsearch-data/es-01') do
      it { should be_directory }
    end

    describe port(test_settings['port_a']) do
      it 'open', :with_retries do should be_listening end
    end

    describe server :container do
      describe http(
        "http://localhost:#{test_settings['port_a']}/_nodes/_local",
        :faraday_middleware => middleware
      ) do
        it 'uses a custom data path' do
          json = JSON.parse(response.body)['nodes'].values.first
          expect(
            json['settings']['path']['data']
          ).to eq('/var/lib/elasticsearch-data/es-01')
        end
      end
    end
  end

  describe 'single data dir from instance', :with_cleanup do
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
          },
          datadir => '#{test_settings['datadir_1']}'
        }
      EOS

      it 'applies cleanly ' do
        apply_manifest pp, :catch_failures => true
      end
      it 'is idempotent' do
        apply_manifest pp , :catch_changes  => true
      end
    end

    describe file('/etc/elasticsearch/es-01/elasticsearch.yml') do
      it { should be_file }
      it { should contain "#{test_settings['datadir_1']}" }
    end

    describe file(test_settings['datadir_1']) do
      it { should be_directory }
    end

    describe port(test_settings['port_a']) do
      it 'open', :with_retries do should be_listening end
    end

    describe server :container do
      describe http(
        "http://localhost:#{test_settings['port_a']}/_nodes/_local",
        :faraday_middleware => middleware
      ) do
        it 'uses the default data path' do
          json = JSON.parse(response.body)['nodes'].values.first
          expect(
            json['settings']['path']['data']
          ).to eq(test_settings['datadir_1'])
        end
      end
    end
  end

  describe 'multiple data dirs from class', :with_cleanup do
    describe 'manifest' do
      pp = <<-EOS
        class { 'elasticsearch':
          config => {
            'cluster.name' => '#{test_settings['cluster_name']}'
          },
          manage_repo => true,
          repo_version => '#{test_settings['repo_version']}',
          java_install => true,
          datadir => [
            '/var/lib/elasticsearch/01',
            '/var/lib/elasticsearch/02'
          ]
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

    describe file('/etc/elasticsearch/es-01/elasticsearch.yml') do
      it { should be_file }
      it { should contain '/var/lib/elasticsearch/01/es-01' }
      it { should contain '/var/lib/elasticsearch/02/es-01' }
    end

    describe file '/var/lib/elasticsearch/01/es-01' do
      it { should be_directory }
    end
    describe file '/var/lib/elasticsearch/02/es-01' do
      it { should be_directory }
    end

    describe port(test_settings['port_a']) do
      it 'open', :with_retries do should be_listening end
    end

    describe server :container do
      describe http(
        "http://localhost:#{test_settings['port_a']}/_nodes/_local",
        :faraday_middleware => middleware
      ) do
        it 'uses custom data paths' do
          json = JSON.parse(response.body)['nodes'].values.first
          expect(
            json['settings']['path']['data']
          ).to contain_exactly(
            '/var/lib/elasticsearch/01/es-01',
            '/var/lib/elasticsearch/02/es-01'
          )
        end
      end
    end
  end

  describe 'multiple data dirs from instance', :with_cleanup do
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
          },
          datadir => [
            '#{test_settings['datadir_1']}',
            '#{test_settings['datadir_2']}'
          ]
        }
      EOS

      it 'applies cleanly ' do
        apply_manifest pp, :catch_failures => true
      end
      it 'is idempotent' do
        apply_manifest pp , :catch_changes  => true
      end
    end

    describe file('/etc/elasticsearch/es-01/elasticsearch.yml') do
      it { should be_file }
      it { should contain test_settings['datadir_1'] }
      it { should contain test_settings['datadir_2'] }
    end

    describe file test_settings['datadir_1'] do
      it { should be_directory }
    end
    describe file test_settings['datadir_2'] do
      it { should be_directory }
    end

    describe port(test_settings['port_a']) do
      it 'open', :with_retries do should be_listening end
    end

    describe server :container do
      describe http(
        "http://localhost:#{test_settings['port_a']}/_nodes/_local",
        :faraday_middleware => middleware
      ) do
        it 'uses custom data paths' do
          json = JSON.parse(response.body)['nodes'].values.first
          expect(
            json['settings']['path']['data']
          ).to contain_exactly(
            test_settings['datadir_1'],
            test_settings['datadir_2']
          )
        end
      end
    end
  end
end
