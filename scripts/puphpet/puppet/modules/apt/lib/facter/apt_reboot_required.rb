# apt_reboot_required.rb
Facter.add(:apt_reboot_required) do
  confine :osfamily => 'Debian'
  setcode do
    File.file?('/var/run/reboot-required')
  end
end
