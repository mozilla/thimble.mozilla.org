vcsrepo { '/tmp/vcstest/p4_client_root':
  ensure   => latest,
  provider => 'p4',
  source   => '//depot/...',
}
