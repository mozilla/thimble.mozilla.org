$source_file = '/tmp/source'

file { $source_file:
  ensure  => file,
  content => 'this is a test',
}

file { ['/tmp/result1', '/tmp/result2']:
  ensure => directory,
}

archive { '/tmp/result1/result':
  ensure  => present,
  name    => '/tmp/result1/result',
  source  => "file://${source_file}",
  extract => false,
  require => File[$source_file],
}

archive { '/tmp/result2/result':
  ensure  => present,
  name    => '/tmp/result2/result',
  source  => "file://${source_file}",
  extract => false,
  require => File[$source_file],
}
