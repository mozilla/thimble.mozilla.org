require 'spec_helper_acceptance'
require 'spec_helper_faraday'
require 'json'

describe 'elasticsearch::package_url' do

  before :all do
    shell "mkdir -p #{default['distmoduledir']}/another/files"

    shell %W{
      cp #{test_settings['local']}
      #{default['distmoduledir']}/another/files/#{test_settings['puppet']}
    }.join(' ')
  end

  context 'via http', :with_cleanup do
    describe 'manifest' do
      pp = <<-EOS
        class { 'elasticsearch':
          package_url => '#{test_settings['url']}',
          java_install => true,
          config => {
            'node.name' => 'elasticsearch001',
            'cluster.name' => '#{test_settings['cluster_name']}'
          }
        }

        elasticsearch::instance{ 'es-01': }
      EOS

      it 'applies cleanly ' do
        apply_manifest pp, :catch_failures => true
      end
      it 'is idempotent' do
        apply_manifest pp , :catch_changes  => true
      end
    end

    describe package(test_settings['package_name']) do
      it { should be_installed }
    end

    describe service(test_settings['service_name_a']) do
      it { should be_enabled }
      it { should be_running }
    end

    describe file(test_settings['pid_file_a']) do
      it { should be_file }
      its(:content) { should match(/[0-9]+/) }
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

  context 'via local file', :with_cleanup do
    describe 'manifest' do
      pp = <<-EOS
        class { 'elasticsearch':
          package_url => 'file:#{test_settings['local']}',
          java_install => true,
          config => {
            'node.name' => 'elasticsearch001',
            'cluster.name' => '#{test_settings['cluster_name']}'
          }
        }

        elasticsearch::instance { 'es-01': }
      EOS

      it 'applies cleanly ' do
        apply_manifest pp, :catch_failures => true
      end
      it 'is idempotent' do
        apply_manifest pp , :catch_changes  => true
      end
    end

    describe package(test_settings['package_name']) do
      it { should be_installed }
    end

    describe service(test_settings['service_name_a']) do
      it { should be_enabled }
      it { should be_running }
    end

    describe file(test_settings['pid_file_a']) do
      it { should be_file }
      its(:content) { should match(/[0-9]+/) }
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

  context 'via puppet', :with_cleanup do
    describe 'manifest' do
      pp = <<-EOS
        class { 'elasticsearch':
          package_url =>
            'puppet:///modules/another/#{test_settings['puppet']}',
          java_install => true,
          config => {
            'node.name' => 'elasticsearch001',
            'cluster.name' => '#{test_settings['cluster_name']}'
          }
        }

        elasticsearch::instance { 'es-01': }
      EOS

      it 'applies cleanly ' do
        apply_manifest pp, :catch_failures => true
      end
      it 'is idempotent' do
        apply_manifest pp , :catch_changes  => true
      end
    end

    describe package(test_settings['package_name']) do
      it { should be_installed }
    end

    describe service(test_settings['service_name_a']) do
      it { should be_enabled }
      it { should be_running }
    end

    describe file(test_settings['pid_file_a']) do
      it { should be_file }
      its(:content) { should match(/[0-9]+/) }
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
end
