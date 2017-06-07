# == Class: apt
#
# Manage APT (Advanced Packaging Tool)
#
class apt (
  $confs    = {},
  $update   = {},
  $purge    = {},
  $proxy    = {},
  $sources  = {},
  $keys     = {},
  $ppas     = {},
  $pins     = {},
  $settings = {},
) inherits ::apt::params {

  $frequency_options = ['always','daily','weekly','reluctantly']
  validate_hash($update)
  if $update['frequency'] {
    validate_re($update['frequency'], $frequency_options)
  }
  if $update['timeout'] {
    unless is_integer($update['timeout']) {
      fail('timeout value for update must be an integer')
    }
  }
  if $update['tries'] {
    unless is_integer($update['tries']) {
      fail('tries value for update must be an integer')
    }
  }

  $_update = merge($::apt::update_defaults, $update)
  include ::apt::update

  validate_hash($purge)
  if $purge['sources.list'] {
    validate_bool($purge['sources.list'])
  }
  if $purge['sources.list.d'] {
    validate_bool($purge['sources.list.d'])
  }
  if $purge['preferences'] {
    validate_bool($purge['preferences'])
  }
  if $purge['preferences.d'] {
    validate_bool($purge['preferences.d'])
  }

  $_purge = merge($::apt::purge_defaults, $purge)

  validate_hash($proxy)
  if $proxy['ensure'] {
    validate_re($proxy['ensure'], ['file', 'present', 'absent'])
  }
  if $proxy['host'] {
    validate_string($proxy['host'])
  }
  if $proxy['port'] {
    unless is_integer($proxy['port']) {
      fail('$proxy port must be an integer')
    }
  }
  if $proxy['https'] {
    validate_bool($proxy['https'])
  }

  $_proxy = merge($apt::proxy_defaults, $proxy)

  validate_hash($confs)
  validate_hash($sources)
  validate_hash($keys)
  validate_hash($settings)
  validate_hash($ppas)
  validate_hash($pins)

  if $_proxy['ensure'] == 'absent' or $_proxy['host'] {
    apt::setting { 'conf-proxy':
      ensure   => $_proxy['ensure'],
      priority => '01',
      content  => template('apt/_conf_header.erb', 'apt/proxy.erb'),
    }
  }

  $sources_list_content = $_purge['sources.list'] ? {
    true    => "# Repos managed by puppet.\n",
    default => undef,
  }

  $preferences_ensure = $_purge['preferences'] ? {
    true    => absent,
    default => file,
  }

  if $_update['frequency'] == 'always' {
    Exec <| title=='apt_update' |> {
      refreshonly => false,
    }
  }

  apt::setting { 'conf-update-stamp':
    priority => 15,
    content  => template('apt/_conf_header.erb', 'apt/15update-stamp.erb'),
  }

  file { 'sources.list':
    ensure  => file,
    path    => $::apt::sources_list,
    owner   => root,
    group   => root,
    mode    => '0644',
    content => $sources_list_content,
    notify  => Class['apt::update'],
  }

  file { 'sources.list.d':
    ensure  => directory,
    path    => $::apt::sources_list_d,
    owner   => root,
    group   => root,
    mode    => '0644',
    purge   => $_purge['sources.list.d'],
    recurse => $_purge['sources.list.d'],
    notify  => Class['apt::update'],
  }

  file { 'preferences':
    ensure => $preferences_ensure,
    path   => $::apt::preferences,
    owner  => root,
    group  => root,
    mode   => '0644',
    notify => Class['apt::update'],
  }

  file { 'preferences.d':
    ensure  => directory,
    path    => $::apt::preferences_d,
    owner   => root,
    group   => root,
    mode    => '0644',
    purge   => $_purge['preferences.d'],
    recurse => $_purge['preferences.d'],
    notify  => Class['apt::update'],
  }

  if $confs {
    create_resources('apt::conf', $confs)
  }
  # manage sources if present
  if $sources {
    create_resources('apt::source', $sources)
  }
  # manage keys if present
  if $keys {
    create_resources('apt::key', $keys)
  }
  # manage ppas if present
  if $ppas {
    create_resources('apt::ppa', $ppas)
  }
  # manage settings if present
  if $settings {
    create_resources('apt::setting', $settings)
  }

  # manage pins if present
  if $pins {
    create_resources('apt::pin', $pins)
  }
}
