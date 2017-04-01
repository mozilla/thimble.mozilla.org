gnupg_key { 'root_key_foo':
  ensure     => present,
  user       => 'root',
  key_server => 'hkp://pgp.mit.edu/',
  key_id     => '20BC0A86',
}

gnupg_key { 'jenkins_key':
  ensure     => present,
  user       => 'root',
  key_id     => 'D50582E6',
  key_source => 'http://pkg.jenkins-ci.org/debian/jenkins-ci.org.key',
}

gnupg_key {'root_remove':
  ensure => absent,
  key_id => D50582E6,
  user   => root,
}

gnupg_key {'add_key_by_remote_source':
  ensure     => present,
  key_id     => F657C4B7,
  user       => root,
  key_source => 'puppet:///modules/gnupg/random.key',
}

gnupg_key {'add_key_by_local_source':
  ensure     => present,
  key_id     => F657C4B7,
  user       => root,
  key_source => '/home/foo/public.key',
}

gnupg_key {'add_key_by_local_source_file':
  ensure     => present,
  key_id     => F657C4B5,
  user       => root,
  key_source => 'file:///home/foo/public.key',
}