class puphpet::server {

  include ::puphpet::params
  include ::git
  include ::ntp
  include ::swap_file

  $server = $puphpet::params::hiera['server']

  each( ['puppet', 'www-data', 'www-user'] ) |$group| {
    if ! defined(Group[$group]) {
      group { $group:
        ensure => present
      }
    }
  }

  case $puphpet::params::ssh_username {
    'root': {
      $user_home   = '/root'
      $manage_home = false
    }
    default: {
      $user_home   = "/home/${puphpet::params::ssh_username}"
      $manage_home = true
    }
  }

  @user { $puphpet::params::ssh_username:
    ensure     => present,
    shell      => '/bin/bash',
    home       => $user_home,
    managehome => $manage_home,
    groups     => ['www-data', 'www-user'],
    require    => [Group['www-data'], Group['www-user']],
  }

  realize(User[$puphpet::params::ssh_username])

  each( ['apache', 'nginx', 'httpd', 'www-data', 'www-user'] ) |$key| {
    if ! defined(User[$key]) {
      user { $key:
        ensure  => present,
        shell   => '/bin/bash',
        groups  => 'www-data',
        require => Group['www-data']
      }
    }
  }

  # copy dot files to ssh user's home directory
  if ! defined(Puphpet::Server::Link_dotfiles[$puphpet::params::ssh_username]) {
    puphpet::server::link_dotfiles { $puphpet::params::ssh_username: }
  }

  case $::osfamily {
    'debian': {
      include apt

      Class['apt::update'] -> Package <|
        title != 'python-software-properties' and
        title != 'software-properties-common'
      |>

      if ! defined(Package['augeas-tools']) {
        package { 'augeas-tools':
          ensure => present,
        }
      }
    }
    'redhat': {
      class { 'yum': extrarepo => ['epel'] }

      Class['::yum'] -> Yum::Managed_yumrepo <| |> -> Package <| |>

      if ! defined(Package['augeas']) {
        package { 'augeas':
          ensure => present,
        }
      }
    }
    default: {
      error('PuPHPet currently only works with Debian and RHEL families')
    }
  }

  case $::operatingsystem {
    'ubuntu': {
      if ! defined(Apt::Key['14AA40EC0831756756D7F66C4F4EA0AAE5267A6C']){
        apt::key { '14AA40EC0831756756D7F66C4F4EA0AAE5267A6C':
          server => 'hkp://keyserver.ubuntu.com:80'
        }
      }

      if ! defined(Apt::Key['945A6177078449082DDCC0E5551CE2FB4CBEDD5A']){
        apt::key { '945A6177078449082DDCC0E5551CE2FB4CBEDD5A':
          server => 'hkp://keyserver.ubuntu.com:80'
        }
      }

      apt::ppa { 'ppa:pdoes/ppa':
        require => Apt::Key['945A6177078449082DDCC0E5551CE2FB4CBEDD5A']
      }
    }
    'redhat', 'centos': {
    }
    default: {
      error('PuPHPet supports Ubuntu, CentOS and RHEL only')
    }
  }

  # config file could contain no packages key
  $packages = array_true($server, 'packages') ? {
    true    => $server['packages'],
    default => { }
  }

  # git handled by module
  $filtered_packages = delete($packages, [
    'git',
  ])

  each( $filtered_packages ) |$package| {
    if ! defined(Package[$package]) {
      package { $package:
        ensure => present,
      }
    }
  }

}
