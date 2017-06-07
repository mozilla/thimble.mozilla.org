test_name "Installing Puppet and vcsrepo module" do
  step 'install puppet' do
    if @options[:provision]
      # This will fail if puppet is already installed, ie --no-provision
      if hosts.first.is_pe?
        install_pe
      else
        install_puppet
        on hosts, "mkdir -p #{hosts.first['distmoduledir']}"
      end
    end
  end

  step 'Ensure we can install our module' do
    hosts.each do |host|
      # We ask the host to interpolate it's distmoduledir because we don't
      # actually know it on Windows until we've let it redirect us (depending
      # on whether we're running as a 32/64 bit process on 32/64 bit Windows
      moduledir = on(host, "echo #{host['distmoduledir']}").stdout.chomp
      on host, "mkdir -p #{moduledir}"
    end
  end

  step 'install module' do
    hosts.each do |host|
      proj_root = File.expand_path(File.join(File.dirname(__FILE__),'..','..'))

      # This require beaker 1.15
      copy_module_to(host, :source => proj_root, :module_name => 'vcsrepo')

      case fact_on(host, 'osfamily')
      when 'RedHat'
        install_package(host, 'git')
      when 'Debian'
        install_package(host, 'git-core')
      else
        if !check_for_package(host, 'git')
          puts "Git package is required for this module"
          exit
        end
      end

      gitconfig = <<-EOS
[user]
	email = root@localhost
	name = root
EOS
      create_remote_file(host, "/root/.gitconfig", gitconfig)
    end
  end
end
