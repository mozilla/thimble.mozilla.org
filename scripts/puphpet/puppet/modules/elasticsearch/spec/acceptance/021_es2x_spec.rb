require 'spec_helper_acceptance'

describe 'elasticsearch 2x' do
  context 'upgrading', :upgrade => true do
    describe '2.0.0 install' do
      describe 'manifest' do
        pp = <<-EOS
          class { 'elasticsearch':
            config => {
              'node.name' => 'elasticsearch001',
              'cluster.name' => '#{test_settings['cluster_name']}',
              'network.host' => '0.0.0.0',
            },
            manage_repo => true,
            repo_version => '#{test_settings['repo_version2x']}',
            java_install => true,
            version => '2.0.0',
            restart_on_change => true,
          }

          elasticsearch::instance { 'es-01':
            config => {
              'node.name' => 'elasticsearch001',
              'http.port' => '#{test_settings['port_a']}'
            }
          }

          Elasticsearch::Plugin { instances => 'es-01' }
          elasticsearch::plugin { 'cloud-aws': }
          elasticsearch::plugin { 'marvel-agent': }
          elasticsearch::plugin { 'license': }
        EOS

        it 'applies cleanly' do
          apply_manifest pp, :catch_failures => true
        end
        it 'is idempotent' do
          apply_manifest pp , :catch_changes  => true
        end
      end

      describe file('/usr/share/elasticsearch/plugins/cloud-aws') do
        it { should be_directory }
      end

      describe port(test_settings['port_a']) do
        it 'open', :with_retries do should be_listening end
      end

      describe server :container do
        describe http(
          "http://localhost:#{test_settings['port_a']}/_cluster/stats",
        ) do
          it 'returns cloud-aws with version 2.0.0', :with_retries do
            json = JSON.parse(response.body)
            plugins = json['nodes']['plugins'].map do |h|
              {
                name: h['name'],
                version: h['version']
              }
            end
            expect(plugins).to include({
              name: 'cloud-aws',
              version: '2.0.0'
            })
          end
        end
      end

      describe server :container do
        describe http "http://localhost:#{test_settings['port_a']}" do
          it 'returns ES version 2.0.0', :with_retries do
            expect(
              JSON.parse(response.body)['version']['number']
            ).to eq('2.0.0')
          end
        end
      end
    end

    describe 'upgrading to 2.0.1' do
      describe 'manifest' do
        pp = <<-EOS
          class { 'elasticsearch':
            config => {
              'node.name' => 'elasticsearch001',
              'cluster.name' => '#{test_settings['cluster_name']}',
              'network.host' => '0.0.0.0',
            },
            manage_repo => true,
            repo_version => '#{test_settings['repo_version2x']}',
            java_install => true,
            version => '2.0.1',
            restart_on_change => true,
          }

          elasticsearch::instance { 'es-01':
            config => {
              'node.name' => 'elasticsearch001',
              'http.port' => '#{test_settings['port_a']}'
            }
          }

          Elasticsearch::Plugin { instances => 'es-01' }
          elasticsearch::plugin { 'cloud-aws': }
          elasticsearch::plugin { 'marvel-agent': }
          elasticsearch::plugin { 'license': }
        EOS

        it 'applies cleanly' do
          apply_manifest pp, :catch_failures => true
        end
        it 'is idempotent' do
          apply_manifest pp , :catch_changes  => true
        end
      end

      describe file('/usr/share/elasticsearch/plugins/cloud-aws') do
        it { should be_directory }
      end

      describe port(test_settings['port_a']) do
        it 'open', :with_retries do should be_listening end
      end

      describe server :container do
        describe http(
          "http://localhost:#{test_settings['port_a']}/_cluster/stats",
        ) do
          it 'reports cloud-aws as upgraded', :with_retries do
            json = JSON.parse(response.body)
            plugins = json['nodes']['plugins'].map do |h|
              {
                name: h['name'],
                version: h['version']
              }
            end
            expect(plugins).to include({
              name: 'cloud-aws',
              version: '2.0.1'
            })
          end
        end
      end

      describe server :container do
        describe http "http://localhost:#{test_settings['port_a']}" do
          it 'reports ES as upgraded', :with_retries do
            expect(
              JSON.parse(response.body)['version']['number']
            ).to eq('2.0.1')
          end
        end
      end
    end
  end
end
