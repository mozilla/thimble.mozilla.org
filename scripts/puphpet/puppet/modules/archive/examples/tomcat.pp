$dirname = 'apache-tomcat-9.0.0.M3'
$filename = "${dirname}.zip"
$install_path = "/opt/${dirname}"

user { 'tomcat':
  ensure => present,
  gid    => 'tomcat',
}

group { 'tomcat':
  ensure => present,
}

file { '/opt/tomcat':
  ensure => 'link',
  target => $install_path,
}

file { $install_path:
  ensure => directory,
  owner  => 'tomcat',
  group  => 'tomcat',
  mode   => '0755',
}

archive { $filename:
  path          => "/tmp/${filename}",
  source        => 'http://www-eu.apache.org/dist/tomcat/tomcat-9/v9.0.0.M3/bin/apache-tomcat-9.0.0.M3.zip',
  checksum      => 'f2aaf16f5e421b97513c502c03c117fab6569076',
  checksum_type => 'sha1',
  extract       => true,
  extract_path  => '/opt',
  creates       => "${install_path}/bin",
  cleanup       => true,
  user          => 'tomcat',
  group         => 'tomcat',
  require       => File[$install_path],
}
