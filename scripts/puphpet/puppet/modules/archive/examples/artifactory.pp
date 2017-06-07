notice(artifactory_sha1('http://bit.ly/1Tfk4vQ'))

archive::artifactory { '/tmp/logo.png':
  url   => 'https://repo.jfrog.org/artifactory/distributions/images/Artifactory_120x75.png',
  owner => 'root',
  group => 'root',
  mode  => '0644',
}

$dirname = 'gradle-1.0-milestone-4-20110723151213+0300'
$filename = "${dirname}-bin.zip"

archive::artifactory { $filename:
  archive_path => '/tmp',
  url          => "http://repo.jfrog.org/artifactory/distributions/org/gradle/${filename}",
  extract      => true,
  extract_path => '/opt',
  creates      => "/opt/${dirname}",
  cleanup      => true,
}

file { '/opt/gradle':
  ensure => link,
  target => "/opt/${dirname}",
}
