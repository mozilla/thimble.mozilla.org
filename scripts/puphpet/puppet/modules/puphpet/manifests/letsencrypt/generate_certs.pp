# == Define Resource Type: puphpet::letsencrypt::generate_certs
#
# Generates SSL certificates using Let's Encrypt certbot-auto tool
#
define puphpet::letsencrypt::generate_certs (
  $webserver_service,
  $domains = $::puphpet::letsencrypt::params::domains
){

  include puphpet::letsencrypt::params

  $pre_hook = $webserver_service ? {
    false   => '',
    default => "--pre-hook 'service ${webserver_service} stop || true'"
  }

  $post_host = $webserver_service ? {
    false   => '',
    default => "--post-hook 'service ${webserver_service} start || true'"
  }

  $cmd_base = join([
    $puphpet::letsencrypt::params::certbot,
    'certonly',
    '--agree-tos',
    '--keep-until-expiring',
    '--standalone',
    '--standalone-supported-challenges http-01',
    '--noninteractive',
    "--email '${puphpet::params::hiera['letsencrypt']['settings']['email']}'",
    $pre_hook,
    $post_host,
  ], ' ')

  each( $domains ) |$key, $domain| {
    $hosts = array_true($domain, 'hosts') ? {
      true    => join($domain['hosts'], ' -d '),
      default => $domain
    }

    $first_host = array_true($domain, 'hosts') ? {
      true    => $domain['hosts'][0],
      default => $domain
    }

    $cmd_final = "${cmd_base} -d ${hosts}"

    $hour   = seeded_rand(23, $::fqdn)
    $minute = seeded_rand(59, $::fqdn)

    exec { "generate ssl cert for ${first_host}":
      command => $cmd_final,
      creates => "/etc/letsencrypt/live/${first_host}/fullchain.pem",
      group   => 'root',
      user    => 'root',
      path    => [ '/bin', '/sbin/', '/usr/sbin/', '/usr/bin' ],
      require => [
        Class['Puphpet::Letsencrypt::Certbot'],
        Puphpet::Firewall::Port['80'],
      ],
    }

    cron { "letsencrypt cron for ${first_host}":
       command  => $cmd_final,
       minute   => "${minute}",
       hour     => "${hour}",
       weekday  => '*',
       month    => '*',
       monthday => '*',
       user     => 'root',
    }
  }

}
