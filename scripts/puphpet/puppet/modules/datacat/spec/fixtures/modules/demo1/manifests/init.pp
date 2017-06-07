class demo1 {
  notify { 'demo1': }

  datacat { '/tmp/demo1':
    template => 'demo1/sheeps.erb',
  }

  datacat_fragment { 'data foo => 1':
    target => '/tmp/demo1',
    data   => { foo => 1 },
  }

  datacat_fragment { 'data bar => 2':
    target => '/tmp/demo1',
    data   => { bar => 2 },
  }
}

