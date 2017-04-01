As we're using the rspec fixtures structure, we can run them quite simply

    rake spec_prep
    puppet apply --modulepath spec/fixtures/modules -e 'include demo1'
