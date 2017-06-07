class puphpet::php::repo::debian {

  case $::operatingsystem {
    'debian': {
      fail('Debian support has been dropped from PuPHPet')
    }
    'ubuntu': {
      if ! defined(Apt::Key['14AA40EC0831756756D7F66C4F4EA0AAE5267A6C']) {
        ::apt::key { '14AA40EC0831756756D7F66C4F4EA0AAE5267A6C':
          server => 'hkp://keyserver.ubuntu.com:80'
        }
      }

      if ! defined(Apt::Ppa['ppa:ondrej/php']) {
        ::apt::ppa { 'ppa:ondrej/php':
          require => ::Apt::Key['14AA40EC0831756756D7F66C4F4EA0AAE5267A6C']
        }
      }
    }
  }

}
