class puphpet::nginx::params
  inherits ::puphpet::params
{

  $webroot_user  = 'www-data'
  $webroot_group = 'www-data'

  $www_location     = '/var/www'
  $webroot_location = '/var/www/html'

  $default_conf_location = '/etc/nginx/conf.d/default.conf'

  $default_vhost = {
    'server_name'          => '_',
    'server_aliases'       => [],
    'www_root'             => $webroot_location,
    'listen_port'          => 80,
    'client_max_body_size' => '1m',
    'use_default_location' => false,
    'vhost_cfg_append'     => {'sendfile' => 'off'},
    'index_files'          => ['index.html', 'index.htm',],
    'locations'            => [ ]
  }

  $allowed_ciphers = [
    'ECDHE-RSA-AES256-GCM-SHA384', 'ECDHE-RSA-AES128-GCM-SHA256',
    'DHE-RSA-AES256-GCM-SHA384', 'DHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-SHA384', 'ECDHE-RSA-AES128-SHA256', 'ECDHE-RSA-AES256-SHA',
    'ECDHE-RSA-AES128-SHA', 'DHE-RSA-AES256-SHA256', 'DHE-RSA-AES128-SHA256',
    'DHE-RSA-AES256-SHA', 'DHE-RSA-AES128-SHA', 'ECDHE-RSA-DES-CBC3-SHA',
    'EDH-RSA-DES-CBC3-SHA', 'AES256-GCM-SHA384', 'AES128-GCM-SHA256', 'AES256-SHA256',
    'AES128-SHA256', 'AES256-SHA', 'AES128-SHA', 'DES-CBC3-SHA',
    'HIGH', '!aNULL', '!eNULL', '!EXPORT', '!DES', '!MD5', '!PSK', '!RC4'
  ]

  $ssl_cert_location = $::osfamily ? {
    'Debian' => '/etc/ssl/certs/ssl-cert-snakeoil.pem',
    'Redhat' => '/etc/ssl/certs/ssl-cert-snakeoil'
  }

  $ssl_key_location = $::osfamily ? {
    'Debian' => '/etc/ssl/private/ssl-cert-snakeoil.key',
    'Redhat' => '/etc/ssl/certs/ssl-cert-snakeoil'
  }

}
