# == Class: erlang::params
#
# Default paramaters setting repository details for different
# operating systems
#
class erlang::params {
  $epel_enable = false

  case $::osfamily {
    'Debian' : {
      $key_signature            = '434975BD900CCBE4F7EE1B1ED208507CA14F4FCA'
      $package_name             = 'erlang-nox'
      $local_repo_location      = undef
      $remote_repo_key_location = 'http://packages.erlang-solutions.com/debian/erlang_solutions.asc'
      $remote_repo_location     = 'http://packages.erlang-solutions.com/debian'
      $repos                    = 'contrib'
    }
    'RedHat', 'SUSE', 'Archlinux' : {
      $key_signature  = undef
      $package_name   = 'erlang'

      if $::operatingsystemrelease and $::operatingsystemrelease =~ /^5/ {
        $local_repo_location  = '/etc/yum.repos.d/epel-erlang.repo'
        $remote_repo_location = 'https://repos.fedorapeople.org/repos/peter/erlang/epel-erlang.repo'
      } else {
        $local_repo_location  = undef
        $remote_repo_location = undef
      }

      $remote_repo_key_location = undef
      $repos                    = undef
    }
    default : {
      fail("The ${module_name} module is not supported on an ${::osfamily} based system.")
    }
  }
}
