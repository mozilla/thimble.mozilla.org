# = Class: redis::preinstall
#
# This class provides anything required by the install class.
# Such as package repositories.
#
class redis::preinstall {
  if $::redis::manage_repo {
    case $::operatingsystem {
      'RedHat', 'CentOS', 'Scientific', 'OEL', 'Amazon': {
        require ::epel
      }

      'Debian': {
        include ::apt
        apt::source { 'dotdeb':
          location => 'http://packages.dotdeb.org/',
          release  =>  $::lsbdistcodename,
          repos    => 'all',
          key      => {
            id     => '6572BBEF1B5FF28B28B706837E3F070089DF5277',
            source => 'http://www.dotdeb.org/dotdeb.gpg',
          },
          include  => { 'src' => true },
        }

      }

      'Ubuntu': {
        include ::apt
        apt::ppa { $::redis::ppa_repo: }
      }

      default: {
      }
    }
  }
}

