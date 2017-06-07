require 'spec_helper_acceptance'

describe 'mongodb::server class' do

  shared_examples 'normal tests' do |tengen|
    if tengen
      case fact('osfamily')
      when 'RedHat'
        package_name = 'mongodb-org-server'
        service_name = 'mongod'
        config_file  = '/etc/mongod.conf'
      when 'Debian'
        package_name = 'mongodb-org-server'
        service_name = 'mongod'
        config_file  = '/etc/mongod.conf'
      end
    else
      case fact('osfamily')
      when 'RedHat'
        package_name = 'mongodb-server'
        service_name = 'mongod'
        config_file  = '/etc/mongodb.conf'
      when 'Debian'
        package_name = 'mongodb-server'
        service_name = 'mongodb'
        config_file  = '/etc/mongodb.conf'
      end
    end

    client_name  = 'mongo --version'

    context "default parameters with 10gen => #{tengen}" do
      after :all do
        if tengen
          puts "XXX uninstalls mongodb because changing the port with tengen doesn't work because they have a crappy init script"
          pp = <<-EOS
            class {'mongodb::globals': manage_package_repo => #{tengen}, }
            -> class { 'mongodb::server':
                 ensure => absent,
                 package_ensure => absent,
                 service_ensure => stopped,
                 service_enable => false
               }
            -> class { 'mongodb::client': ensure => absent, }
          EOS
          apply_manifest(pp, :catch_failures => true)
        end
      end

      it 'should work with no errors' do
        pp = <<-EOS
          class { 'mongodb::globals': manage_package_repo => #{tengen}, }
          -> class { 'mongodb::server': }
          -> class { 'mongodb::client': }
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

      describe command(client_name) do
        describe '#exit_status' do
          subject { super().exit_status }
          it { is_expected.to eq 0 }
        end
      end
    end

    context "test using custom port and 10gen => #{tengen}" do
      it 'change port to 27018' do
        pp = <<-EOS
          class { 'mongodb::globals': manage_package_repo => #{tengen}, }
          -> class { 'mongodb::server': port => 27018, }
          -> class { 'mongodb::client': }
        EOS

        apply_manifest(pp, :catch_failures => true)
        apply_manifest(pp, :catch_changes  => true)
      end

      describe port(27018) do
        it { is_expected.to be_listening }
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
        EOS
        apply_manifest(pp, :catch_failures => true)
      end
    end
  end

  shared_examples 'auth tests' do |tengen|
    if tengen
      case fact('osfamily')
      when 'RedHat'
        package_name = 'mongodb-org-server'
        service_name = 'mongod'
        config_file  = '/etc/mongod.conf'
      when 'Debian'
        package_name = 'mongodb-org-server'
        service_name = 'mongod'
        config_file  = '/etc/mongod.conf'
      end
    else
      case fact('osfamily')
      when 'RedHat'
        package_name = 'mongodb-server'
        service_name = 'mongod'
        config_file  = '/etc/mongodb.conf'
      when 'Debian'
        package_name = 'mongodb-server'
        service_name = 'mongodb'
        config_file  = '/etc/mongodb.conf'
      end
    end

    client_name  = 'mongo --version'

    auth_enabled = 'mongo --quiet --eval "db.serverCmdLineOpts().code"'
    admin_login = "mongo admin --quiet --eval \"load('/root/.mongorc.js');printjson(db.getUser('admin')['customData'])\""

    context "default parameters with 10gen => #{tengen} and auth => true" do
      it 'should work with no errors with authentication enabled' do
        pp = <<-EOS
          class { 'mongodb::globals': manage_package_repo => #{tengen}, }
          -> class { 'mongodb::server':
            auth           => true,
            create_admin   => true,
            store_creds    => true,
            admin_username => 'admin',
            admin_password => 'password'
          }
          class { 'mongodb::client': }
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

      describe command(auth_enabled) do
        describe '#stdout' do
          subject { super().stdout.strip }
          it { is_expected.to eq "13" }
        end
      end

      describe file('/root/.mongorc.js') do
        it { is_expected.to be_file }
        it { is_expected.to be_owned_by 'root' }
        it { is_expected.to be_grouped_into 'root' }
        it { is_expected.to be_mode 644 }
        it { is_expected.to contain 'db.auth(\'admin\', \'password\')' }
      end

      describe command(admin_login) do
        describe '#stdout' do
          subject { super().stdout.strip }
          it { is_expected.to match "{ \"createdBy\" : \"Puppet Mongodb_user['User admin on db admin']\" }"}
        end
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
        EOS
        apply_manifest(pp, :catch_failures => true)
      end
    end
  end

  it_behaves_like 'normal tests', false
  it_behaves_like 'normal tests', true
  it_behaves_like 'auth tests', true
end
