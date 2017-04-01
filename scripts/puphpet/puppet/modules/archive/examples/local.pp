include ::archive

archive { '/tmp/test.zip':
  source => 'file:///vagrant/files/test.zip',
}

archive { '/tmp/test2.zip':
  source => '/vagrant/files/test.zip',
}

# NOTE: expected to fail
archive { '/tmp/test3.zip':
  source => '/vagrant/files/invalid.zip',
}
