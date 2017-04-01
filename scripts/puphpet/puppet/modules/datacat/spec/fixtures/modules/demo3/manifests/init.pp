#
class demo3 {
  datacat { '/tmp/demo3':
    template => 'demo3/hostgroups.cfg.erb',
  }

  $host1 = 'foo.example.com'
  datacat_fragment { 'foo host':
    target => '/tmp/demo3',
    data   => {
      device => [ $host1 ],
    },
  }

  $ilo_fqdn = 'foo-ilo.example.com'
  datacat_fragment { 'foo ilo':
    target => '/tmp/demo3',
    data   => {
      device => [ $ilo_fqdn ],
    },
  }
}
