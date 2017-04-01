require 'spec_helper_acceptance'

describe "Integration testing" do

  describe "Setup Elasticsearch" do

    it 'should run successfully' do
      pp = "class { 'elasticsearch': config => { 'cluster.name' => '#{test_settings['cluster_name']}'}, java_install => true, package_url => '#{test_settings['snapshot_package']}' }
            elasticsearch::instance { 'es-01': config => { 'node.name' => 'elasticsearch001', 'http.port' => '#{test_settings['port_a']}' } }
           "

      # Run it twice and test for idempotency
      apply_manifest(pp, :catch_failures => true)
      expect(apply_manifest(pp, :catch_failures => true).exit_code).to be_zero
    end


    describe service(test_settings['service_name_a']) do
      it { should be_enabled }
      it { should be_running }
    end

    describe package(test_settings['package_name']) do
      it { should be_installed }
    end

    describe file(test_settings['pid_file_a']) do
      it { should be_file }
      its(:content) { should match /[0-9]+/ }
    end

    describe "Elasticsearch serves requests on" do
      it {
        curl_with_retries("check ES on #{test_settings['port_a']}", default, "http://localhost:#{test_settings['port_a']}/?pretty=true", 0)
      }
    end

    describe file('/etc/elasticsearch/es-01/elasticsearch.yml') do
      it { should be_file }
      it { should contain 'name: elasticsearch001' }
    end

    describe file('/usr/share/elasticsearch/templates_import') do
      it { should be_directory }
    end

  end

  describe "Plugin tests" do

    describe "Install a plugin from official repository" do

      it 'should run successfully' do
        pp = "class { 'elasticsearch': config => { 'cluster.name' => '#{test_settings['cluster_name']}'}, java_install => true, package_url => '#{test_settings['snapshot_package']}' }
              elasticsearch::instance { 'es-01': config => { 'node.name' => 'elasticsearch001', 'http.port' => '#{test_settings['port_a']}' } }
              elasticsearch::plugin{'#{ENV['LICENSE_PLUGIN_NAME']}': instances => 'es-01', url => '#{ENV['LICENSE_PLUGIN_URL']}' }
              elasticsearch::plugin{'#{ENV['PLUGIN_NAME']}': instances => 'es-01', url => '#{ENV['PLUGIN_URL']}' }
             "

        # Run it twice and test for idempotency
        apply_manifest(pp, :catch_failures => true)
        expect(apply_manifest(pp, :catch_failures => true).exit_code).to be_zero
      end

      describe service(test_settings['service_name_a']) do
        it { should be_enabled }
        it { should be_running }
      end

      describe package(test_settings['package_name']) do
        it { should be_installed }
      end

      describe file(test_settings['pid_file_a']) do
        it { should be_file }
        its(:content) { should match /[0-9]+/ }
      end

      it 'make sure the directory exists' do
        shell("ls /usr/share/elasticsearch/plugins/#{ENV['PLUGIN_NAME']}", {:acceptable_exit_codes => 0})
      end

      it 'make sure elasticsearch reports it as existing' do
        curl_with_retries('validated plugin as installed', default, "http://localhost:#{test_settings['port_a']}/_nodes/?plugin | grep #{ENV['PLUGIN_NAME']}", 0)
      end

    end

  end

end
