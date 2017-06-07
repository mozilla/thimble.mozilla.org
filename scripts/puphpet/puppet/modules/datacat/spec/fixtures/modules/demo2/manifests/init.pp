class demo2 {
  notify { 'demo2': }

  datacat { '/tmp/demo2':
    template => 'demo2/merging.erb',
  }

  datacat_fragment { 'data foo => 1, 2':
    target => '/tmp/demo2',
    data   => { foo => [ 1, 2 ] },
  }

  datacat_fragment { 'data foo => 2, 3':
    target => '/tmp/demo2',
    data   => { foo => [ 2, 3 ] },
  }
}

