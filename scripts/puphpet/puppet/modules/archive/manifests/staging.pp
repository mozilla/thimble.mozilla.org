# Class: archive::staging
# =======================
#
# backwards compatibility class for staging module.
#
class archive::staging (
  $path  = $archive::params::path,
  $owner = $archive::params::owner,
  $group = $archive::params::group,
  $mode  = $archive::params::mode,
) inherits archive::params {
  include '::archive'

  if !defined(File[$path]) {
    file { $path:
      ensure => directory,
      owner  => $owner,
      group  => $group,
      mode   => $mode,
    }
  }
}
