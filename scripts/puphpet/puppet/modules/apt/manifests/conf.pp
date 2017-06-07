define apt::conf (
  $content       = undef,
  $ensure        = present,
  $priority      = 50,
  $notify_update = undef,
) {

  unless $ensure == 'absent' {
    unless $content {
      fail('Need to pass in content parameter')
    }
  }

  apt::setting { "conf-${name}":
    ensure        => $ensure,
    priority      => $priority,
    content       => template('apt/_conf_header.erb', 'apt/conf.erb'),
    notify_update => $notify_update,
  }
}
