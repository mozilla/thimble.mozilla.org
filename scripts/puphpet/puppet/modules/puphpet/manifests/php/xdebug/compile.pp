class puphpet::php::xdebug::compile
 inherits puphpet::php::xdebug::params {

  include puphpet::php::params

  vcsrepo { "${puphpet::params::puphpet_state_dir}/xdebug":
    ensure   => present,
    provider => git,
    source   => $puphpet::php::xdebug::params::git_source,
    require  => Package[$puphpet::php::params::dev_package]
  }
  -> exec { 'phpize && ./configure --enable-xdebug && make':
    creates => "${puphpet::params::puphpet_state_dir}/xdebug/configure",
    cwd     => "${puphpet::params::puphpet_state_dir}/xdebug",
  }
  -> exec { 'copy xdebug.so to modules dir':
    command => "cp ${puphpet::params::puphpet_state_dir}/xdebug/modules/xdebug.so `php-config --extension-dir`/xdebug.so \
                && touch ${puphpet::params::puphpet_state_dir}/xdebug-installed",
    creates => "${puphpet::params::puphpet_state_dir}/xdebug-installed",
  }

  puphpet::php::ini { 'xdebug/zend_extension':
    entry       => "XDEBUG/zend_extension",
    value       => 'xdebug.so',
    php_version => $puphpet::php::params::version_match,
    webserver   => $puphpet::php::params::service,
    require     => Exec['copy xdebug.so to modules dir'],
  }

}
