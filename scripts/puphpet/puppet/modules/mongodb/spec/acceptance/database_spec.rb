require 'spec_helper_acceptance'

describe 'mongodb_database' do
  case fact('osfamily')
  when 'RedHat'
    version = "'2.6.6-1'"
  when 'Debian'
    version = "'2.6.6'"
  end
  shared_examples 'normal tests' do |tengen, version|
    context "when manage_package_repo is #{tengen} and version is #{version}" do
      describe 'creating a database' do
        context 'with default port' do
          after :all do
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
          it 'should compile with no errors' do
            pp = <<-EOS
              class { 'mongodb::globals': manage_package_repo => #{tengen}, version => #{version.nil? ? 'undef' : version} }
              -> class { 'mongodb::server': }
              -> class { 'mongodb::client': }
              -> mongodb::db { 'testdb1':
                user     => 'testuser',
                password => 'testpass',
              }
              -> mongodb::db { 'testdb2':
                user     => 'testuser',
                password => 'testpass',
              }
            EOS
            apply_manifest(pp, :catch_failures => true)
          end
          pending("setting password is broken, non idempotent") do
            apply_manifest(pp, :catch_changes  => true)
          end
          it 'should create the databases' do
            shell("mongo testdb1 --eval 'printjson(db.getMongo().getDBs())'")
            shell("mongo testdb2 --eval 'printjson(db.getMongo().getDBs())'")
          end
        end

        # MODULES-878
        context 'with custom port' do
          after :all do
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
          it 'should work with no errors' do
            pp = <<-EOS
              class { 'mongodb::globals': manage_package_repo => #{tengen}, }
              -> class { 'mongodb::server': port => 27018 }
              -> class { 'mongodb::client': }
              -> mongodb::db { 'testdb1':
                user     => 'testuser',
                password => 'testpass',
              }
              -> mongodb::db { 'testdb2':
                user     => 'testuser',
                password => 'testpass',
              }
            EOS

            apply_manifest(pp, :catch_failures => true)
          end
          pending("setting password is broken, non idempotent") do
            apply_manifest(pp, :catch_changes  => true)
          end
          it 'should create the database' do
            shell("mongo testdb1 --port 27018 --eval 'printjson(db.getMongo().getDBs())'")
            shell("mongo testdb2 --port 27018 --eval 'printjson(db.getMongo().getDBs())'")
          end
        end
      end
    end
  end

  it_behaves_like 'normal tests', false, nil
  it_behaves_like 'normal tests', true, nil # This will give a key-value config file even though the version will be 2.6
  it_behaves_like 'normal tests', true, version # This will give the YAML config file for 2.6
end
