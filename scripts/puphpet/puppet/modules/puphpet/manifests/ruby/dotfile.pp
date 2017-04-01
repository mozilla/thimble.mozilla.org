# This depends on maestrodev/rvm: https://github.com/maestrodev/puppet-rvm
# Sets up .rvmrc files in user home directories
define puphpet::ruby::dotfile {

  include ::puphpet::params

  if $puphpet::params::ssh_username != 'root' {
    file { "/home/${puphpet::params::ssh_username}/.rvmrc":
      ensure  => present,
      owner   => $puphpet::params::ssh_username,
      require => User[$puphpet::params::ssh_username]
    }
    file_line { 'rvm_autoupdate_flag=0 >> ~/.rvmrc':
      ensure  => present,
      line    => 'rvm_autoupdate_flag=0',
      path    => "/home/${puphpet::params::ssh_username}/.rvmrc",
      require => File["/home/${puphpet::params::ssh_username}/.rvmrc"],
    }
  }

  file { '/root/.rvmrc':
    ensure => present,
    owner  => 'root',
  }
  file_line { 'rvm_autoupdate_flag=0 >> /root/.rvmrc':
    ensure  => present,
    line    => 'rvm_autoupdate_flag=0',
    path    => '/root/.rvmrc',
    require => File['/root/.rvmrc'],
  }

}
