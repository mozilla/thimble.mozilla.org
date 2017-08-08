VAGRANTFILE_API_VERSION = "2"

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.network :forwarded_port, host: 2015, guest: 2015 # publish.webmaker.org
  config.vm.network :forwarded_port, host: 8001, guest: 8001 # Published projects
  config.vm.network :forwarded_port, host: 1234, guest: 1234 # id.webmaker.org
  config.vm.network :forwarded_port, host: 3000, guest: 3000 # login.webmaker.org

  # Testing seems to indicate that 1 cpu and 1.5G of RAM are sufficient to run the
  # VM, but users are encouraged to test this and make adjustments below (or file PRs)
  # if you find the VM lagging or unresponsive.
  config.vm.provider "virtualbox" do |v|
    v.memory = 1536
    v.cpus = 1
    v.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/vagrant", "1"]
  end

  # One-time provisioning of OS, services, and node deps
  config.vm.provision :shell, path: "scripts/setup-services.sh"

  # Always provision Thimble and necessary node apps
  config.vm.provision "shell",
    run: "always",
    privileged: false,
    inline: "pm2 startOrRestart /vagrant/ecosystem.json"
end
