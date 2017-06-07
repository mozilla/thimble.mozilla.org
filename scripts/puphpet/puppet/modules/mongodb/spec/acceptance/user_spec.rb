require 'spec_helper_acceptance'

describe 'mongodb_database' do
  case fact('osfamily')
  when 'RedHat'
    version = "'2.6.6-1'"
  when 'Debian'
    version = "'2.6.6'"
  end
  shared_examples 'normal tests' do |version|
    context "when version is #{version.nil? ? 'nil' : version}" do
      describe 'creating a database' do
        context 'with default port' do
          after :all do
            puts "XXX uninstalls mongodb because changing the port with tengen doesn't work because they have a crappy init script"
            pp = <<-EOS
              class {'mongodb::globals': manage_package_repo => true, }
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
              class { 'mongodb::globals': manage_package_repo => true, version => #{version.nil? ? 'undef' : version} }
              -> class { 'mongodb::server': }
              -> class { 'mongodb::client': }
              -> mongodb_database { 'testdb': ensure => present }
              ->
              mongodb_user {'testuser':
                ensure        => present,
                password_hash => mongodb_password('testuser', 'passw0rd'),
                database      => 'testdb',
              }
            EOS

            apply_manifest(pp, :catch_failures => true)
            apply_manifest(pp, :catch_changes => true)
          end

          it 'should create the user' do
            shell("mongo testdb --quiet --eval 'db.auth(\"testuser\",\"passw0rd\")'") do |r|
              expect(r.stdout.chomp).to eq("1")
            end
          end
        end

        # MODULES-878
        context 'with custom port' do
          after :all do
            puts "XXX uninstalls mongodb because changing the port with tengen doesn't work because they have a crappy init script"
            pp = <<-EOS
              class {'mongodb::globals': manage_package_repo => true, }
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
              class { 'mongodb::globals': manage_package_repo => true, }
              -> class { 'mongodb::server': port => 27018 }
              -> class { 'mongodb::client': }
              -> mongodb_database { 'testdb': ensure => present }
              ->
              mongodb_user {'testuser':
                ensure        => present,
                password_hash => mongodb_password('testuser', 'passw0rd'),
                database      => 'testdb',
              }
            EOS

            apply_manifest(pp, :catch_failures => true)
            apply_manifest(pp, :catch_changes => true)
          end

          it 'should create the user' do
            shell("mongo testdb --quiet --port 27018 --eval 'db.auth(\"testuser\",\"passw0rd\")'") do |r|
              expect(r.stdout.chomp).to eq("1")
            end
          end
        end
      end
    end
  end

  it_behaves_like 'normal tests', nil # This will give a key-value config file even though the version will be 2.6
  it_behaves_like 'normal tests', version # This will give the YAML config file for 2.6
end
