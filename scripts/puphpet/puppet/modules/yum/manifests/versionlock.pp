# = Define yum::versionlock
#
define yum::versionlock (
  $ensure = present,
  $path   = '/etc/yum/pluginconf.d/versionlock.list',
) {

  include yum::plugin::versionlock

  if ($name =~ /^[0-9]+:.+\*$/) {
    $manage_name = $name
  } elsif ($name =~ /^[0-9]+:.+-.+-.+\./) {
    $manage_name= $name
  } else {
    fail('Package name must be formated as \'EPOCH:NAME-VERSION-RELEASE.ARCH\'')
  }

  file_line { "versionlock.list-${name}":
    ensure  => $ensure,
    line    => $manage_name,
    path    => $path,
    require => Class['yum::plugin::versionlock']
  }
}
