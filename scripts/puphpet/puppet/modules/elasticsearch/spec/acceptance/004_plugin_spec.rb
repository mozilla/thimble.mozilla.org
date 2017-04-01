require 'spec_helper_acceptance'
require 'spec_helper_faraday'
require 'json'

shared_examples 'plugin behavior' do |version, user, plugin, offline, config|
  describe "plugin operations on #{version}" do
    context 'official repo', :with_cleanup do
      describe 'manifest' do
        pp = <<-EOS
          class { 'elasticsearch':
            config => {
              'node.name' => 'elasticsearch001',
              'cluster.name' => '#{test_settings['cluster_name']}',
              'network.host' => '0.0.0.0',
            },
            manage_repo => true,
            #{config}
            java_install => true,
            restart_on_change => true,
          }

          elasticsearch::instance { 'es-01':
            config => {
              'node.name' => 'elasticsearch001',
              'http.port' => '#{test_settings['port_a']}'
            }
          }

          elasticsearch::plugin { 'mobz/elasticsearch-head':
             instances => 'es-01'
          }
        EOS

        it 'applies cleanly ' do
          apply_manifest pp, :catch_failures => true
        end
        it 'is idempotent' do
          apply_manifest pp , :catch_changes  => true
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

    # Pending
    context 'custom git repo' do
      describe 'manifest'
      describe file('/usr/share/elasticsearch/plugins/head/')
      describe server :container
    end

    if fact('puppetversion') =~ /3\.[2-9]\./
      context 'invalid plugin', :with_cleanup do
        describe 'manifest' do
          pp = <<-EOS
            class { 'elasticsearch':
              config => {
                'node.name' => 'elasticearch001',
                'cluster.name' => '#{test_settings['cluster_name']}',
                'network.host' => '0.0.0.0',
              },
              manage_repo => true,
              #{config}
              java_install => true
            }

            elasticsearch::instance { 'es-01':
              config => {
                'node.name' => 'elasticsearch001',
                'http.port' => '#{test_settings['port_a']}'
              }
            }

            elasticsearch::plugin { 'elasticsearch/non-existing':
              instances => 'es-01'
            }
          EOS

          it 'fails to apply cleanly' do
            apply_manifest pp, :expect_failures => true
          end
        end
      end
    else
      # The exit codes have changes since Puppet 3.2x
      # Since beaker expectations are based on the most recent puppet code
      # all runs on previous versions fails.
    end

    describe "running ES under #{user} user", :with_cleanup do
      describe 'manifest' do
        pp = <<-EOS
          class { 'elasticsearch':
            config => {
              'node.name' => 'elasticsearch001',
              'cluster.name' => '#{test_settings['cluster_name']}',
              'network.host' => '0.0.0.0',
            },
            manage_repo => true,
            #{config}
            java_install => true,
            elasticsearch_user => '#{user}',
            elasticsearch_group => '#{user}',
            restart_on_change => true,
          }

          elasticsearch::instance { 'es-01':
            config => {
              'node.name' => 'elasticsearch001',
              'http.port' => '#{test_settings['port_a']}'
            }
          }

          elasticsearch::plugin { '#{plugin[:prefix]}#{plugin[:name]}/#{plugin[:old]}':
            instances => 'es-01'
          }
        EOS

        it 'applies cleanly ' do
          apply_manifest pp, :catch_failures => true
        end
        it 'is idempotent' do
          apply_manifest pp , :catch_changes  => true
        end
      end

      describe file("/usr/share/elasticsearch/plugins/#{plugin[:name]}/") do
        it { should be_directory }
      end

      describe port(test_settings['port_a']) do
        it 'open', :with_retries do should be_listening end
      end

      describe server :container do
        describe http(
          "http://localhost:#{test_settings['port_a']}/_cluster/stats",
        ) do
          it 'reports the plugin as installed', :with_retries do
            plugins = JSON.parse(response.body)['nodes']['plugins'].map do |h|
              {
                name: h['name'],
                version: h['version']
              }
            end
            expect(plugins).to include({
              name: plugin[:name],
              version: plugin[:old]
            })
          end
        end
      end
    end

    if version =~ /^1/
      describe 'upgrading', :with_cleanup do
        describe 'manifest' do
          pp = <<-EOS
            class { 'elasticsearch':
              config => {
                'node.name' => 'elasticsearch001',
                'cluster.name' => '#{test_settings['cluster_name']}',
                'network.host' => '0.0.0.0',
              },
              manage_repo => true,
              #{config}
              java_install => true,
              elasticsearch_user => '#{user}',
              elasticsearch_group => '#{user}',
              restart_on_change => true,
            }

            elasticsearch::instance { 'es-01':
              config => {
                'node.name' => 'elasticsearch001',
                'http.port' => '#{test_settings['port_a']}'
              }
            }

            elasticsearch::plugin { '#{plugin[:prefix]}#{plugin[:name]}/#{plugin[:new]}':
              instances => 'es-01'
            }
          EOS

          it 'applies cleanly ' do
            apply_manifest pp, :catch_failures => true
          end
          it 'is idempotent' do
            apply_manifest pp , :catch_changes  => true
          end
        end

        describe port(test_settings['port_a']) do
          it 'open', :with_retries do should be_listening end
        end

        describe server :container do
          describe http(
            "http://localhost:#{test_settings['port_a']}/_cluster/stats",
          ) do
            it 'reports the upgraded plugin version', :with_retries do
              j = JSON.parse(response.body)['nodes']['plugins'].find do |h|
                h['name'] == plugin[:name]
              end
              expect(j).to include('version' => plugin[:new])
            end
          end
        end
      end
    end

    describe 'offline installation via puppet://', :with_cleanup do
      describe 'manifest' do
        pp = <<-EOS
          class { 'elasticsearch':
            config => {
              'node.name' => 'elasticsearch001',
              'cluster.name' => '#{test_settings['cluster_name']}',
              'network.host' => '0.0.0.0',
            },
            manage_repo => true,
            #{config}
            java_install => true,
            elasticsearch_user => '#{user}',
            elasticsearch_group => '#{user}',
            restart_on_change => true,
          }

          elasticsearch::instance { 'es-01':
            config => {
              'node.name' => 'elasticsearch001',
              'http.port' => '#{test_settings['port_a']}'
            }
          }

          elasticsearch::plugin { '#{offline}':
            source => 'puppet:///modules/another/elasticsearch-#{offline}.zip',
            instances => 'es-01'
          }
        EOS

        it 'applies cleanly ' do
          apply_manifest pp, :catch_failures => true
        end
        it 'is idempotent' do
          apply_manifest pp , :catch_changes  => true
        end
      end

      describe port(test_settings['port_a']) do
        it 'open', :with_retries do should be_listening end
      end

      describe server :container do
        describe http(
          "http://localhost:#{test_settings['port_a']}/_cluster/stats",
        ) do
          it 'reports the plugin as installed', :with_retries do
            plugins = JSON.parse(response.body)['nodes']['plugins']
            expect(plugins.first).to include('name' => offline)
          end
        end
      end
    end

    describe 'installation via url', :with_cleanup do
      describe 'manifest' do
        pp = <<-EOS
          class { 'elasticsearch':
            config => {
              'node.name' => 'elasticsearch001',
              'cluster.name' => '#{test_settings['cluster_name']}',
              'network.host' => '0.0.0.0',
            },
            manage_repo => true,
            #{config}
            java_install => true,
            restart_on_change => true,
          }

          elasticsearch::instance { 'es-01':
            config => {
              'node.name' => 'elasticsearch001',
              'http.port' => '#{test_settings['port_a']}'
            }
          }

          elasticsearch::plugin { 'hq':
            url => 'https://github.com/royrusso/elasticsearch-HQ/archive/v2.0.3.zip',
            instances => 'es-01'
          }
        EOS

        it 'applies cleanly ' do
          apply_manifest pp, :catch_failures => true
        end
        it 'is idempotent' do
          apply_manifest pp , :catch_changes  => true
        end
      end

      describe port(test_settings['port_a']) do
        it 'open', :with_retries do should be_listening end
      end

      describe server :container do
        describe http(
          "http://localhost:#{test_settings['port_a']}/_cluster/stats",
        ) do
          it 'reports the plugin as installed', :with_retries do
            plugins = JSON.parse(response.body)['nodes']['plugins'].map do |h|
              h['name']
            end
            expect(plugins).to include('hq')
          end
        end
      end
    end
  end
end

describe 'elasticsearch::plugin' do
  before :all do
    shell "mkdir -p #{default['distmoduledir']}/another/files"

    shell %W{
      ln -sf /tmp/elasticsearch-bigdesk.zip
      #{default['distmoduledir']}/another/files/elasticsearch-bigdesk.zip
    }.join(' ')

    shell %W{
      ln -sf /tmp/elasticsearch-kopf.zip
      #{default['distmoduledir']}/another/files/elasticsearch-kopf.zip
    }.join(' ')
  end

  include_examples 'plugin behavior',
    test_settings['repo_version'],
    'root',
    {
      prefix: 'elasticsearch/elasticsearch-',
      name: 'cloud-aws',
      old: '2.1.1',
      new: '2.2.0',
    },
    'bigdesk',
    "repo_version => '#{test_settings['repo_version']}',"

  include_examples 'plugin behavior',
    test_settings['repo_version2x'],
    'elasticsearch',
    {
      prefix: 'lmenezes/elasticsearch-',
      name: 'kopf',
      old: '2.0.1',
      new: '2.1.1',
    },
    'kopf',
    <<-EOS
      repo_version => '#{test_settings['repo_version2x']}',
      version => '2.0.0',
    EOS
end
