vcsrepo { '/tmp/vcstest/p4_client_root':
  ensure   => absent,
  provider => 'p4',
}
