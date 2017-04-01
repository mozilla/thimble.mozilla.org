  def pre_run
    apply_manifest("class { 'mysql::server': root_password => 'password' }", :catch_failures => true)
    @mysql_version = (on default, 'mysql --version').output.chomp.match(/\d+\.\d+\.\d+/)[0]
  end

  def version_is_greater_than(version)
    return Puppet::Util::Package.versioncmp(@mysql_version, version) > 0
  end
