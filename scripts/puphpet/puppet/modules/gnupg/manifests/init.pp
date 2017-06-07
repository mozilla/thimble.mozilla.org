# == Class: gnupg
#
# Manage gnupg and public key entries
#
# === Parameters
#
# [*package_ensure*]
#   Remove or install the s3tools package. Possible values
#   present or absent, however most of modern Linux distros relays on
#   gnupg so you shouldn't remove the package
#
# [*package_name*]
#   name of the package usually gnupg/gnupg2 depends of the distro
#
# === Examples
#
#  include gnupg
#
# === Authors
#
# Dejan Golja <dejan@golja.org>
#
class gnupg(
  $package_ensure = $gnupg::params::package_ensure,
  $package_name   = $gnupg::params::package_name,
) inherits gnupg::params {

  class {'::gnupg::install': }
}
