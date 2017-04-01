# source.pp
# add an apt source
define apt::source(
  $location          = undef,
  $comment           = $name,
  $ensure            = present,
  $release           = undef,
  $repos             = 'main',
  $include           = {},
  $key               = undef,
  $pin               = undef,
  $architecture      = undef,
  $allow_unsigned    = false,
  $include_src       = undef,
  $include_deb       = undef,
  $required_packages = undef,
  $key_server        = undef,
  $key_content       = undef,
  $key_source        = undef,
  $trusted_source    = undef,
  $notify_update     = undef,
) {
  validate_string($architecture, $comment, $location, $repos)
  validate_bool($allow_unsigned)
  validate_hash($include)

  # This is needed for compat with 1.8.x
  include ::apt

  $_before = Apt::Setting["list-${title}"]

  if $include_src != undef {
    warning("\$include_src is deprecated and will be removed in the next major release, please use \$include => { 'src' => ${include_src} } instead")
  }

  if $include_deb != undef {
    warning("\$include_deb is deprecated and will be removed in the next major release, please use \$include => { 'deb' => ${include_deb} } instead")
  }

  if $required_packages != undef {
    warning('$required_packages is deprecated and will be removed in the next major release, please use package resources instead.')
    exec { "Required packages: '${required_packages}' for ${name}":
      command     => "${::apt::params::provider} -y install ${required_packages}",
      logoutput   => 'on_failure',
      refreshonly => true,
      tries       => 3,
      try_sleep   => 1,
      before      => $_before,
    }
  }

  if $key_server != undef {
    warning("\$key_server is deprecated and will be removed in the next major release, please use \$key => { 'server' => ${key_server} } instead.")
  }

  if $key_content != undef {
    warning("\$key_content is deprecated and will be removed in the next major release, please use \$key => { 'content' => ${key_content} } instead.")
  }

  if $key_source != undef {
    warning("\$key_source is deprecated and will be removed in the next major release, please use \$key => { 'source' => ${key_source} } instead.")
  }

  if $trusted_source != undef {
    warning('$trusted_source is deprecated and will be removed in the next major release, please use $allow_unsigned instead.')
    $_allow_unsigned = $trusted_source
  } else {
    $_allow_unsigned = $allow_unsigned
  }

  if ! $release {
    $_release = $::apt::params::xfacts['lsbdistcodename']
    unless $_release {
      fail('lsbdistcodename fact not available: release parameter required')
    }
  } else {
    $_release = $release
  }

  if $ensure == 'present' and ! $location {
    fail('cannot create a source entry without specifying a location')
  }

  if $include_src != undef and $include_deb != undef {
    $_deprecated_include = {
      'src' => $include_src,
      'deb' => $include_deb,
    }
  } elsif $include_src != undef {
    $_deprecated_include = { 'src' => $include_src }
  } elsif $include_deb != undef {
    $_deprecated_include = { 'deb' => $include_deb }
  } else {
    $_deprecated_include = {}
  }

  $_include = merge($::apt::params::include_defaults, $_deprecated_include, $include)

  $_deprecated_key = {
    'key_server'  => $key_server,
    'key_content' => $key_content,
    'key_source'  => $key_source,
  }

  if $key {
    if is_hash($key) {
      unless $key['id'] {
        fail('key hash must contain at least an id entry')
      }
      $_key = merge($::apt::params::source_key_defaults, $_deprecated_key, $key)
    } else {
      validate_string($key)
      $_key = merge( { 'id' => $key }, $_deprecated_key)
    }
  }

  apt::setting { "list-${name}":
    ensure        => $ensure,
    content       => template('apt/_header.erb', 'apt/source.list.erb'),
    notify_update => $notify_update,
  }

  if $pin {
    if is_hash($pin) {
      $_pin = merge($pin, { 'ensure' => $ensure, 'before' => $_before })
    } elsif (is_numeric($pin) or is_string($pin)) {
      $url_split = split($location, '/')
      $host      = $url_split[2]
      $_pin = {
        'ensure'   => $ensure,
        'priority' => $pin,
        'before'   => $_before,
        'origin'   => $host,
      }
    } else {
      fail('Received invalid value for pin parameter')
    }
    create_resources('apt::pin', { "${name}" => $_pin })
  }

  # We do not want to remove keys when the source is absent.
  if $key and ($ensure == 'present') {
    if is_hash($_key) {
      apt::key { "Add key: ${$_key['id']} from Apt::Source ${title}":
        ensure      => present,
        id          => $_key['id'],
        server      => $_key['server'],
        content     => $_key['content'],
        source      => $_key['source'],
        options     => $_key['options'],
        key_server  => $_key['key_server'],
        key_content => $_key['key_content'],
        key_source  => $_key['key_source'],
        before      => $_before,
      }
    }
  }
}
