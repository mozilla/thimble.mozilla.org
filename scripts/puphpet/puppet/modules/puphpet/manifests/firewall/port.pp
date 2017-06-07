# Open specific ports
#
define puphpet::firewall::port (
  $port     = false,
  $protocol = tcp,
  $action   = 'accept',
  $priority = 100,
) {

  if is_array($port) {
    $port_string = join($port, ',')
    $port_real   = $port
  } elsif $port {
    $port_string = $port
    $port_real   = $port
  } else {
    $port_string = $name
    $port_real   = $name
  }

  $rule_name = "${priority} ${protocol}/${port_string}"

  if ! defined(Firewall[$rule_name]) {
    firewall { $rule_name:
      dport  => $port_real,
      proto  => $protocol,
      action => $action,
    }
  }
}
