# This depends on maestrodev/rvm: https://github.com/maestrodev/puppet-rvm
# Sets up .rvmrc files in user home directories
define puphpet::server::link_dotfiles {

  include ::puphpet::params

  case $name {
    'root': {
      $user_home   = '/root'
      $manage_home = false
    }
    default: {
      $user_home   = "/home/${name}"
      $manage_home = true
    }
  }

  exec { "dotfiles for ${name}":
    cwd     => $user_home,
    command => "cp -r ${puphpet::params::puphpet_core_dir}/files/dot/.[a-zA-Z0-9]* ${user_home}/ && \
                chown -R ${name} ${user_home}/.[a-zA-Z0-9]* && \
                cp -r ${puphpet::params::puphpet_core_dir}/files/dot/.[a-zA-Z0-9]* /root/",
    onlyif  => "test -d ${puphpet::params::puphpet_core_dir}/files/dot",
    returns => [0, 1],
    require => User[$name]
  }

}
