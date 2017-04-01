Facter.add("mysqld_version") do
  setcode do
    Facter::Util::Resolution.exec('mysqld -V 2>/dev/null')
  end
end
