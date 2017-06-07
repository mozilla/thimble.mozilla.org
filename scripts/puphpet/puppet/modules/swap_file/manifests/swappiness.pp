# Allows setting the kernel swappiness setting
#
# @example Will set the sysctl setting for swappiness to 75
#   class { '::swap_file::swappiness':
#     swappiness => 75,
#   }
#
# @param [String] swapiness Swapiness level, integer from 0 - 100 inclusive
#
# @author - Peter Souter
#
class swap_file::swappiness (
  $swappiness = 60,
) {

  validate_integer($swappiness, 100, 0)

  sysctl { 'vm.swappiness':
    ensure    => 'present',
    permanent => true,
    value     => $swappiness,
  }

}
