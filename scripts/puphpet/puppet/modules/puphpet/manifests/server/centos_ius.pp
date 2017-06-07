class puphpet::server::centos_ius {

  $path = "${puphpet::params::puphpet_state_dir}/ius.sh"

  puphpet::server::wget { $path:
    source => 'https://setup.ius.io/',
    user   => 'root',
    group  => 'root',
    mode   => '+x'
  }
  -> exec { "${path} && touch ${puphpet::params::puphpet_state_dir}/ius.sh-ran":
    creates => "${puphpet::params::puphpet_state_dir}/ius.sh-ran",
    timeout => 3600,
    path    => '/bin:/sbin:/usr/bin:/usr/sbin',
  }

}
