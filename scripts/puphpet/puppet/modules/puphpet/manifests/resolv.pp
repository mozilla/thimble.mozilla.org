# Class for configuring resolv.conf
#
class puphpet::resolv {

  include ::puphpet::params

  $resolv = $puphpet::params::hiera['resolv']

  $nameservers = array_true($resolv, 'nameservers') ? {
    true    => $resolv['nameservers'],
    default => ['8.8.8.8', '8.8.4.4']
  }

  $domainname = array_true($resolv, 'domainname') ? {
    true    => $resolv['domainname'],
    default => undef
  }

  $searchpath = array_true($resolv, 'searchpath') ? {
    true    => $resolv['searchpath'],
    default => [ ]
  }

  $settings = delete(merge($resolv, {
    'nameservers' => $nameservers,
    'domainname'  => $domainname,
    'searchpath'  => $searchpath,
  }), 'install')

  create_resources('class', { 'resolv_conf' => $settings })

}
