VAGRANTFILE_API_VERSION = "2"

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.provision :shell, path: "scripts/start-services.sh"
  config.vm.network :forwarded_port, host: 3500, guest: 3500 # Thimble
  config.vm.network :forwarded_port, host: 5432, guest: 5432 # Postgres
  config.vm.network :forwarded_port, host: 2015, guest: 2015 # publish.webmaker.org
  config.vm.network :forwarded_port, host: 8001, guest: 8001 # Published projects
  config.vm.network :forwarded_port, host: 1234, guest: 1234 # id.webmaker.org
  config.vm.network :forwarded_port, host: 3000, guest: 3000 #login.webmaker.org
  config.vm.provider "virtualbox" do |v|
    v.memory = 2048
    v.cpus = 2
    v.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/vagrant", "1"]
  end
end
