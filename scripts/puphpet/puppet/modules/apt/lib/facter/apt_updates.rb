apt_package_updates = nil
Facter.add("apt_has_updates") do
  confine :osfamily => 'Debian'
  if File.executable?("/usr/bin/apt-get")
    apt_get_result = Facter::Util::Resolution.exec('/usr/bin/apt-get -s upgrade 2>&1')
    if not apt_get_result.nil?
      apt_package_updates = [[], []]
      apt_get_result.each_line do |line|
        if line =~ /^Inst\s/
          package = line.gsub(/^Inst\s([^\s]+)\s.*/, '\1').strip
          apt_package_updates[0].push(package)
          security_matches = [
            / Debian[^\s]+-updates /,
            / Debian-Security:/,
            / Ubuntu[^\s]+-security /,
            / gNewSense[^\s]+-security /
          ]
          re = Regexp.union(security_matches)
          if line.match(re)
            apt_package_updates[1].push(package)
          end
        end
      end
    end
  end

  setcode do
    if not apt_package_updates.nil? and apt_package_updates.length == 2
      apt_package_updates != [[], []]
    end
  end
end

Facter.add("apt_package_updates") do
  confine :apt_has_updates => true
  setcode do
    if Facter.version < '2.0.0'
      apt_package_updates[0].join(',')
    else
      apt_package_updates[0]
    end
  end
end

Facter.add("apt_updates") do
  confine :apt_has_updates => true
  setcode do
    Integer(apt_package_updates[0].length)
  end
end

Facter.add("apt_security_updates") do
  confine :apt_has_updates => true
  setcode do
    Integer(apt_package_updates[1].length)
  end
end
