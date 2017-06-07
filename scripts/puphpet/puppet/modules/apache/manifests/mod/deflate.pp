class apache::mod::deflate (
  $types = [
    'text/html text/plain text/xml',
    'text/css',
    'application/x-javascript application/javascript application/ecmascript',
    'application/rss+xml',
    'application/json',
  ],
  $notes = {
    'Input'  => 'instream',
    'Output' => 'outstream',
    'Ratio'  => 'ratio',
  }
) {
  include ::apache
  ::apache::mod { 'deflate': }

  file { 'deflate.conf':
    ensure  => file,
    path    => "${::apache::mod_dir}/deflate.conf",
    mode    => $::apache::file_mode,
    content => template('apache/mod/deflate.conf.erb'),
    require => Exec["mkdir ${::apache::mod_dir}"],
    before  => File[$::apache::mod_dir],
    notify  => Class['apache::service'],
  }
}
