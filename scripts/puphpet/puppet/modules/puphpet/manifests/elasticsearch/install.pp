# == Class: puphpet::elasticsearch::install
#
# Installs Elasticsearch engine.
# Installs Java and opens ports
#
# Usage:
#
#  class { 'puphpet::elasticsearch::install': }
#
class puphpet::elasticsearch::install
  inherits puphpet::params
{

  $elasticsearch = $puphpet::params::hiera['elasticsearch']

  if ! defined(Puphpet::Firewall::Port['9200']) {
    puphpet::firewall::port { '9200': }
  }

  $settings = $elasticsearch['settings']

  if ! defined(Class['java']) and $settings['java_install'] {
    class { 'java':
      distribution => 'jre',
    }
  }

  $merged = merge($settings, {
    'java_install' => false,
    'manage_repo'  => true,
    'repo_version' => '2.x',
  })

  create_resources('class', { 'elasticsearch' => $merged })

  # config file could contain no instance keys
  $instances = array_true($elasticsearch, 'instances') ? {
    true    => $elasticsearch['instances'],
    default => { }
  }

  each( $instances ) |$key, $instance| {
    $name = $instance['name']

    create_resources( elasticsearch::instance, { "${name}" => $instance })
  }

}
