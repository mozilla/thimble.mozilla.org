require 'beaker-rspec'
require 'beaker/puppet_install_helper'

run_puppet_install_helper unless ENV['BEAKER_provision'] == 'no'

RSpec.configure do |c|
  # Project root
  proj_root = File.expand_path(File.join(File.dirname(__FILE__), '..'))

  # Readable test descriptions
  c.formatter = :documentation

  c.before :suite do
    # Install module and dependencies
    puppet_module_install(:source => proj_root, :module_name => 'redis')

    hosts.each do |host|
      if fact('osfamily') == 'Debian'
        # These should be on all Deb-flavor machines by default...
        # But Docker is often more slimline
        shell('apt-get install apt-transport-https software-properties-common -y', { :acceptable_exit_codes => [0] })
      end
      on host, puppet('module', 'install', 'puppetlabs-stdlib -v 4.11.0'), { :acceptable_exit_codes => [0] }
      on host, puppet('module', 'install', 'puppetlabs-apt -v 2.3.0'), { :acceptable_exit_codes => [0] }
      on host, puppet('module', 'install', 'stahnma-epel -v 1.0.2'), { :acceptable_exit_codes => [0] }
    end
  end
end
