# Class for adding Debian/Ubuntu MariaDB repo
#
class puphpet::mariadb::repo::debian (
  $version = $::puphpet::mariadb::params::version
){

  $os       = downcase($::operatingsystem)
  $location = "http://mirror.jmu.edu/pub/mariadb/repo/${version}/${os}"

  if ! defined(Apt::Key['199369E5404BD5FC7D2FE43BCBCB082A1BB943DB']) {
    ::apt::key { '199369E5404BD5FC7D2FE43BCBCB082A1BB943DB':
      server => 'hkp://keyserver.ubuntu.com:80'
    }
  }

  ::apt::source { 'mariadb':
    location => $location,
    release  => $::lsbdistcodename,
    repos    => 'main',
    key      => {
      'id'     => '177F4010FE56CA3336300305F1656F24C74CD1D8',
      'server' => 'hkp://keyserver.ubuntu.com:80',
    },
    include  => { 'src' => true },
    require  => Apt::Key['199369E5404BD5FC7D2FE43BCBCB082A1BB943DB'],
  }

  apt::pin { 'mariadb':
    packages => '*',
    priority => 1000,
    origin   => 'mirror.jmu.edu',
  }

}


