class { '::archive':
  aws_cli_install => true,
}

archive { '/tmp/gravatar.png':
  ensure => present,
  source => 's3://bodecoio/gravatar.png',
}
