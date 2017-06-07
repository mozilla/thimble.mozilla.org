# == Class: git::subtree
#
# Installs and configure git-subtree
#
class git::subtree {

  include ::git

  Package['git'] -> Class['git::subtree']

  if (versioncmp('1.7.0', $::git_version) > 0) {
    fail 'git-subtree requires git 1.7 or later!'
  }

  if (versioncmp('1.7.11', $::git_version) > 0) {
    $source_dir = '/usr/src/git-subtree'
    vcsrepo { $source_dir:
      ensure   => present,
      source   => 'https://github.com/apenwarr/git-subtree.git',
      provider => 'git',
      revision => '2793ee6ba',
      before   => Exec['Build git-subtree'],
    }
  } else {
    $source_dir = "${::git_html_path}/contrib/subtree"
  }

  exec { 'Build git-subtree':
    command => "make prefix=/usr libexecdir=${::git_exec_path}",
    creates => "${source_dir}/git-subtree",
    cwd     => $source_dir,
    path    => ['/usr/bin', '/bin', '/usr/local/bin'],
  }
  ->
  package { [ 'asciidoc', 'xmlto', ]:
    ensure => present,
  }
  ->
  exec { 'Install git-subtree':
    command => "make prefix=/usr libexecdir=${::git_exec_path} install",
    onlyif  => [
      "test ! -f ${::git_exec_path}/git-subtree",
      'test ! -f /usr/share/man/man1/git-subtree.1',
    ],
    cwd     => $source_dir,
    path    => ['/usr/bin', '/bin', '/usr/local/bin'],
  }

  file { '/etc/bash_completion.d/git-subtree':
    ensure => file,
    source => 'puppet:///modules/git/subtree/bash_completion.sh',
    owner  => 'root',
    group  => 'root',
    mode   => '0644',
  }

}
