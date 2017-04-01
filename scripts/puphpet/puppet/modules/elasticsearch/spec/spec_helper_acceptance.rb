require 'beaker-rspec'
require 'pry'
require 'securerandom'
require 'thread'
require 'infrataster/rspec'
require 'rspec/retry'
require_relative 'spec_acceptance_integration'
require_relative 'spec_helper_tls'

def test_settings
  RSpec.configuration.test_settings
end

RSpec.configure do |c|
  c.add_setting :test_settings, :default => {}

  # rspec-retry
  c.display_try_failure_messages = true
  c.default_sleep_interval = 5
  # General-case retry keyword for unstable tests
  c.around :each, :with_retries do |example|
    example.run_with_retry retry: 4
  end
  # More forgiving retry config for really flaky tests
  c.around :each, :with_generous_retries do |example|
    example.run_with_retry retry: 10
  end

  # Helper hook for module cleanup
  c.after :context, :with_cleanup do
    apply_manifest <<-EOS
      class { 'elasticsearch':
        ensure      => 'absent',
        manage_repo => true,
      }
      elasticsearch::instance { 'es-01': ensure => 'absent' }

      file { '/usr/share/elasticsearch/plugin':
        ensure  => 'absent',
        force   => true,
        recurse => true,
        require => Class['elasticsearch'],
      }
    EOS
  end
end

files_dir = ENV['files_dir'] || './spec/fixtures/artifacts'

hosts.each do |host|

  # Install Puppet
  if host.is_pe?
    pe_progress = Thread.new { while sleep 5 ; print '.' ; end }
    install_pe
    pe_progress.exit
  else
    install_puppet_on host, :default_action => 'gem_install'

    if fact('osfamily') == 'Suse'
      install_package host, '--force-resolution augeas-devel libxml2-devel'
      install_package host, 'ruby-devel' if fact('operatingsystem') == 'SLES'
      on host, "gem install ruby-augeas --no-ri --no-rdoc"
    end

    if host[:type] == 'aio'
      on host, "mkdir -p /var/log/puppetlabs/puppet"
    end
  end

  if ENV['ES_VERSION']

    case fact('osfamily')
      when 'RedHat'
        if ENV['ES_VERSION'][0,1] == '1'
          ext='noarch.rpm'
        else
          ext='rpm'
        end
      when 'Debian'
        ext='deb'
      when  'Suse'
        ext='rpm'
    end

    url = get_url
    RSpec.configuration.test_settings['snapshot_package'] = url.gsub('$EXT$', ext)
  else

    case fact('osfamily')
      when 'RedHat'
        package_name = 'elasticsearch-1.3.1.noarch.rpm'
      when 'Debian'
        case fact('lsbmajdistrelease')
          when '6'
            package_name = 'elasticsearch-1.1.0.deb'
          else
            package_name = 'elasticsearch-1.3.1.deb'
        end
      when 'Suse'
        package_name = 'elasticsearch-1.3.1.noarch.rpm'
    end

    snapshot_package = {
        :src => "#{files_dir}/#{package_name}",
        :dst => "/tmp/#{package_name}"
    }

    scp_to(host, snapshot_package[:src], snapshot_package[:dst])
    scp_to(host, "#{files_dir}/elasticsearch-bigdesk.zip", "/tmp/elasticsearch-bigdesk.zip")
    scp_to(host, "#{files_dir}/elasticsearch-kopf.zip", "/tmp/elasticsearch-kopf.zip")

    RSpec.configuration.test_settings['snapshot_package'] = "file:#{snapshot_package[:dst]}"

  end

  Infrataster::Server.define(:docker) do |server|
    server.address = host[:ip]
    server.ssh = host[:ssh].tap { |s| s.delete :forward_agent }
  end
  Infrataster::Server.define(:container) do |server|
    server.address = host[:vm_ip] # this gets ignored anyway
    server.from = :docker
  end
end

RSpec.configure do |c|

  # Uncomment for verbose test descriptions.
  # Readable test descriptions
  # c.formatter = :documentation

  # Configure all nodes in nodeset
  c.before :suite do

    # Install module and dependencies
    install_dev_puppet_module :ignore_list => [
      'junit'
    ] + Beaker::DSL::InstallUtils::ModuleUtils::PUPPET_MODULE_INSTALL_IGNORE

    hosts.each do |host|

      copy_hiera_data_to(host, 'spec/fixtures/hiera/hieradata/')

      modules = ['stdlib', 'java', 'datacat', 'java_ks']

      dist_module = {
        'Debian' => 'apt',
        'Suse'   => 'zypprepo',
        'RedHat' => 'yum',
      }[fact('osfamily')]

      modules << dist_module if not dist_module.nil?

      modules.each do |mod|
        copy_module_to host, {
          :module_name => mod,
          :source      => "spec/fixtures/modules/#{mod}"
        }
      end

      if host.is_pe?
        on(host, 'sed -i -e "s/PATH=PATH:\/opt\/puppet\/bin:/PATH=PATH:/" ~/.ssh/environment')
      end

      on(host, 'mkdir -p etc/puppet/modules/another/files/')

    end
  end

  c.after :suite do
    if ENV['ES_VERSION']
      hosts.each do |host|
        timestamp = Time.now
        log_dir = File.join('./spec/logs', timestamp.strftime("%F_%H_%M_%S"))
        FileUtils.mkdir_p(log_dir) unless File.directory?(log_dir)
        scp_from(host, '/var/log/elasticsearch', log_dir)
      end
    end
  end

end

require_relative 'spec_acceptance_common'
