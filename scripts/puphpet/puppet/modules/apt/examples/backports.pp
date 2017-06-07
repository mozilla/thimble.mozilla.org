# Set up a backport for linuxmint qiana
class { 'apt': }
apt::backports { 'qiana':
  location => 'http://us.archive.ubuntu.com/ubuntu',
  release  => 'trusty-backports',
  repos    => 'main universe multiverse restricted',
  key      => {
    id     => '630239CC130E1A7FD81A27B140976EAF437D05B5',
    server => 'hkps.pool.sks-keyservers.net',
  },
}
