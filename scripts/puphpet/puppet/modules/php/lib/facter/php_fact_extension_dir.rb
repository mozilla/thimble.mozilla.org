Facter.add("php_fact_extension_dir") do
  setcode do
    Facter::Util::Resolution.exec('php -r "ini_alter(\'date.timezone\',\'UTC\'); phpinfo();"|grep \'^extension_dir\'|awk \'{ print $3 }\'')    || nil
  end
end
