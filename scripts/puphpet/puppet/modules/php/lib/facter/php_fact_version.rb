Facter.add("php_fact_version") do
  setcode do
    Facter::Util::Resolution.exec('php -v|awk \'{ print $2 }\'|head -n1')    || nil
  end
end
