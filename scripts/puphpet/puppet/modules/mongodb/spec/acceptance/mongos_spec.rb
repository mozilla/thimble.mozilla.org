require 'spec_helper_acceptance'

describe 'mongodb::mongos class' do

  shared_examples 'normal tests' do |tengen|
    if tengen
      package_name = 'mongodb-org-mongos'
    else
      package_name = 'mongodb-server'
    end
    service_name = 'mongos'
    config_file  = '/etc/mongodb-shard.conf'

    client_name  = 'mongo --version'

    context "default parameters with 10gen => #{tengen}" do
      after :all do
        if tengen
          puts "XXX uninstalls mongodb and mongos because changing the port with tengen doesn't work because they have a crappy init script"
          pp = <<-EOS
            class {'mongodb::globals': manage_package_repo => #{tengen}, }
            -> class { 'mongodb::server':
                 ensure => absent,
                 package_ensure => absent,
                 service_ensure => stopped,
                 service_enable => false
               }
            -> class { 'mongodb::client': ensure => absent, }
            -> class { 'mongodb::mongos':
                 ensure => absent,
                 package_ensure => absent,
                 service_ensure => stopped,
                 service_enable => false
             }
          EOS
          apply_manifest(pp, :catch_failures => true)
        end
      end

      it 'should work with no errors' do
        pp = <<-EOS
          class { 'mongodb::globals': manage_package_repo => #{tengen},
          } -> class { 'mongodb::server':
               configsvr => true,
          }
          -> class { 'mongodb::client': }
          -> class { 'mongodb::mongos':
               configdb => ['127.0.0.1:27019'],
          }
        EOS

        apply_manifest(pp, :catch_failures => true)
        apply_manifest(pp, :catch_changes  => true)
      end

      describe package(package_name) do
        it { is_expected.to be_installed }
      end

      describe file(config_file) do
        it { is_expected.to be_file }
      end

      describe service(service_name) do
         it { is_expected.to be_enabled }
         it { is_expected.to be_running }
      end

      describe port(27017) do
        it { is_expected.to be_listening }
      end

      describe port(27019) do
        it { is_expected.to be_listening }
      end

      describe command(client_name) do
        describe '#exit_status' do
          subject { super().exit_status }
          it { is_expected.to eq 0 }
        end
      end
    end

    describe "uninstalling with 10gen => #{tengen}" do
      it 'uninstalls mongodb' do
        pp = <<-EOS
          class {'mongodb::globals': manage_package_repo => #{tengen}, }
          -> class { 'mongodb::server':
               ensure => absent,
               package_ensure => absent,
               service_ensure => stopped,
               service_enable => false
             }
          -> class { 'mongodb::client': ensure => absent, }
          -> class { 'mongodb::mongos':
               ensure         => absent,
               package_ensure => absent,
               service_ensure => stopped,
               service_enable => false
             }
        EOS
        apply_manifest(pp, :catch_failures => true)
      end
    end
  end

  it_behaves_like 'normal tests', false
  it_behaves_like 'normal tests', true
end
