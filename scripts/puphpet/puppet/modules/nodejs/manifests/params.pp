# = Class: nodejs::params
#
# This class defines default parameters used by the main module class nodejs.
# Operating Systems differences in names and paths are addressed here.
#
# == Variables:
#
# Refer to nodejs class for the variables defined here.
#
# == Usage:
#
# This class is not intended to be used directly.
# It may be imported or inherited by other classes.
#
class nodejs::params {
  $install_dir = '/usr/local/node'
  $target_dir  = '/usr/local/bin'
}

