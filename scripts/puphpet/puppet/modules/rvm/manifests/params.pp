# Default module parameters
class rvm::params($manage_group = true) {

  $manage_rvmrc = $::osfamily ? {
    'Windows' => false,
    default   => true
  }

  $group = $::operatingsystem ? {
    default => 'rvm',
  }

  $proxy_url = undef
  $no_proxy = undef
  $key_server = 'hkp://keys.gnupg.net'

  # install the gpg key if gpg is installed or being installed in this puppet run
  if defined(Class['::gnupg']) or $::gnupg_installed {
    $gnupg_key_id = 'D39DC0E3'
  } else {
    $gnupg_key_id = false
  }

  # ignored param, using gnupg module
  $gpg_package = $::kernel ? {
    /(Linux|Darwin)/ => 'gnupg2',
    default          => undef,
  }
}
