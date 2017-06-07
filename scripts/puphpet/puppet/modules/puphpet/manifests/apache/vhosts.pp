# == Define Resource Type: puphpet::apache::vhosts
#
# Adds vhosts to Apache config.
# Creates docroot directories, configures SSL keys,
# opens listen ports.
#
# Usage:
#
# puphpet::apache::vhosts { 'name':
#   vhosts => {
#     unique_vhost_key => {
#       servername      => 'awesome.dev',
#       serveraliases   => [ 'www.awesome.dev', ],
#       docroot         => '/var/www/awesome/web',
#       port            => '80',
#       setenvif        => [ 'Authorization "(.*)" HTTP_AUTHORIZATION=$1', ]
#       custom_fragment => '',
#       ssl             => '0',
#       ssl_cert        => '',
#       ssl_key         => '',
#       ssl_chain       => '',
#       ssl_certs_dir   => '',
#       ssl_protocol    => '',
#       ssl_cipher      => '',
#       directories     => {
#         unique_directory_key => {
#           provider        => 'directory',
#           path            => '/var/www/awesome/web',
#           directoryindex  => 'app.dev',
#           options         => [
#             'Indexes',
#             'FollowSymlinks',
#             'MultiViews',
#           ],
#           allow_override  => [ 'All', ],
#           require         => [ 'all granted', ],
#           custom_fragment => '',
#         },
#       files_match     => {
#         unique_files_match_key => {
#           provider        => 'filesmatch',
#           path            => '/(app_dev|config)\.php$',
#           sethandler      => 'proxy:fcgi://127.0.0.1:9000',
#           setenv          => [ 'APP_ENV dev', ],
#           custom_fragment => '',
#         },
#       },
#     },
#   },
# }#
#
define puphpet::apache::vhosts (
  $vhosts = $::puphpet::apache::params::vhosts
){

  include ::puphpet::apache::params

  $apache = $puphpet::params::hiera['apache']

  each( $vhosts ) |$key, $vhost| {
    exec { "exec mkdir -p ${vhost['docroot']} @ key ${key}":
      command => "mkdir -m 775 -p ${vhost['docroot']}",
      user    => $puphpet::apache::params::webroot_user,
      group   => $puphpet::apache::params::webroot_group,
      creates => $vhost['docroot'],
      require => Exec['Create apache webroot'],
    }

    $ssl = array_true($vhost, 'ssl')
    $ssl_cert = array_true($vhost, 'ssl_cert') ? {
      true    => $vhost['ssl_cert'],
      default => $puphpet::apache::params::ssl_cert_location
    }
    $ssl_key = array_true($vhost, 'ssl_key') ? {
      true    => $vhost['ssl_key'],
      default => $puphpet::apache::params::ssl_key_location
    }
    $ssl_chain = array_true($vhost, 'ssl_chain') ? {
      true    => $vhost['ssl_chain'],
      default => undef
    }
    $ssl_certs_dir = array_true($vhost, 'ssl_certs_dir') ? {
      true    => $vhost['ssl_certs_dir'],
      default => undef
    }
    $ssl_protocol = array_true($vhost, 'ssl_protocol') ? {
      true    => $vhost['ssl_protocol'],
      default => 'TLSv1 TLSv1.1 TLSv1.2',
    }
    $ssl_cipher = array_true($vhost, 'ssl_cipher') ? {
      true    => $vhost['ssl_cipher'],
      default => join($puphpet::apache::params::ssl_ciphers, ':'),
    }

    $letsencrypt = $ssl_cert == 'LETSENCRYPT'

    $ssl_cert_real = $letsencrypt ? {
      true    => "/etc/letsencrypt/live/${vhost['servername']}/cert.pem",
      default => $ssl_cert,
    }
    $ssl_key_real = $letsencrypt ? {
      true    => "/etc/letsencrypt/live/${vhost['servername']}/privkey.pem",
      default => $ssl_key,
    }
    $ssl_chain_real = $letsencrypt ? {
      true    => "/etc/letsencrypt/live/${vhost['servername']}/chain.pem",
      default => $ssl_chain,
    }
    $ssl_certs_dir_real = $letsencrypt ? {
      true    => "/etc/letsencrypt/live/${vhost['servername']}",
      default => $ssl_certs_dir,
    }

    if array_true($vhost, 'directories') {
      $directories_hash = $vhost['directories']
    } else {
      $directories_hash = {}
    }

    if array_true($vhost, 'files_match') {
      $files_match_hash = $vhost['files_match']
    } else {
      $files_match_hash = {}
    }

    $directories_merged = merge($directories_hash, $files_match_hash)

    $vhost_custom_fragment = array_true($vhost, 'custom_fragment') ? {
      true    => file($vhost['custom_fragment']),
      default => '',
    }

    $vhost_merged = delete(merge($vhost, {
      'directories'     => values_no_error($directories_merged),
      'ssl'             => $ssl,
      'ssl_cert'        => $ssl_cert_real,
      'ssl_key'         => $ssl_key_real,
      'ssl_chain'       => $ssl_chain_real,
      'ssl_certs_dir'   => $ssl_certs_dir_real,
      'ssl_protocol'    => $ssl_protocol,
      'ssl_cipher'      => "\"${ssl_cipher}\"",
      'custom_fragment' => $vhost_custom_fragment,
      'manage_docroot'  => false
    }), 'files_match')

    create_resources(::apache::vhost, { "${key}" => $vhost_merged })

    if ! defined(Puphpet::Firewall::Port["${vhost['port']}"]) {
      puphpet::firewall::port { "${vhost['port']}": }
    }
  }

}
