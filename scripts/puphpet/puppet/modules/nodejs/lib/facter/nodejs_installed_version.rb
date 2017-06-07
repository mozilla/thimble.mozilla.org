Facter.add("nodejs_installed_version") do
  setcode do
    Facter::Util::Resolution.exec('node -v 2> /dev/null')
  end
end
