require 'beaker-rspec'
require 'beaker/puppet_install_helper'

run_puppet_install_helper

RSpec.configure do |c|
  # Project root
  proj_root = File.expand_path(File.join(File.dirname(__FILE__), '..'))

  # Readable test descriptions
  c.formatter = :documentation

  # Configure all nodes in nodeset
  c.before :suite do

    # ensure test dependencies are available on all hosts
    hosts.each do |host|
      copy_module_to(host, :source => proj_root, :module_name => 'vcsrepo')
      case fact_on(host, 'osfamily')
      when 'RedHat'
        if fact_on(host, 'operatingsystemmajrelease') == '5'
          will_install_git = on(host, 'which git', :acceptable_exit_codes => [0,1]).exit_code == 1

          if will_install_git
            on host, puppet('module install stahnma-epel')
            apply_manifest_on( host, 'include epel' )
          end

        end

        install_package(host, 'git')

      when 'Debian'
        install_package(host, 'git-core')

      else
        if !check_for_package(host, 'git')
          puts "Git package is required for this module"
          exit
        end
      end
      on host, 'git config --global user.email "root@localhost"'
      on host, 'git config --global user.name "root"'
    end
  end
end
