vcsrepo { '/tmp/git':
    ensure   => 'present',
    provider => 'git',
    source   => 'https://github.com/git/git.git',
    branch   => 'v2.2.0',
    depth    => 1,
}
