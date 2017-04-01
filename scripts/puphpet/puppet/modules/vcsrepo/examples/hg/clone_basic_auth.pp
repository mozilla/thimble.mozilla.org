vcsrepo { '/path/to/repo':
  ensure              => latest,
  provider            => 'hg',
  source              => 'http://hg.example.com/myrepo',
  basic_auth_username => 'hgusername',
  basic_auth_password => 'hgpassword',
}
