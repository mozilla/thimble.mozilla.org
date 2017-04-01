require 'spec_helper_acceptance'

if fact('osfamily') != 'Suse'
  describe 'elasticsearch::package_pin', :with_cleanup do
    describe 'initial installation' do
      describe 'manifest' do
        pp = <<-EOS
          class { 'elasticsearch':
            config => {
              'cluster.name' => '#{test_settings['cluster_name']}'
            },
            manage_repo => true,
            repo_version => '#{test_settings['repo_version']}',
            version => '#{test_settings['install_package_version']}',
            java_install => true
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

      describe package(test_settings['package_name']) do
        it do
          should be_installed.with_version(test_settings['install_version'])
        end
      end
    end

    describe 'package manager upgrade' do
      it 'should run successfully' do
        case fact('osfamily')
        when 'Debian'
          shell 'apt-get update && apt-get -y install elasticsearch'
        when 'RedHat'
          shell 'yum -y update elasticsearch'
        end
      end
    end

    describe package(test_settings['package_name']) do
      it do
        should be_installed.with_version(test_settings['install_version'])
      end
    end

    describe 'puppet upgrade' do
      describe 'manifest' do
        pp = <<-EOS
          class { 'elasticsearch':
            config => {
              'cluster.name' => '#{test_settings['cluster_name']}'
            },
            manage_repo => true,
            repo_version => '#{test_settings['repo_version']}',
            version => '#{test_settings['upgrade_package_version']}',
            java_install => true
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

      describe package(test_settings['package_name']) do
        it do
          should be_installed.with_version(test_settings['upgrade_version'])
        end
      end
    end

    describe 'package manager second upgrade' do
      it 'should run successfully' do
        case fact('osfamily')
        when 'Debian'
          shell 'apt-get update && apt-get -y install elasticsearch'
        when 'RedHat'
          shell 'yum -y update elasticsearch'
        end
      end
    end

    describe package(test_settings['package_name']) do
      it do
        should be_installed.with_version(test_settings['upgrade_version'])
      end
    end
  end
end
