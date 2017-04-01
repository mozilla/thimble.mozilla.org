package { 'debian-keyring':
  ensure => present
}

package { 'debian-archive-keyring':
  ensure => present
}

apt::source { 'debian_unstable':
  location => 'http://debian.mirror.iweb.ca/debian/',
  release  => 'unstable',
  repos    => 'main contrib non-free',
  pin      => '-10',
  key      => {
    id     => 'A1BD8E9D78F7FE5C3E65D8AF8B48AD6246925553',
    server => 'subkeys.pgp.net',
  },
}
