# Docs
README.md

# Add the ability for datacat_fragment to load data from files on agent

    # No reason why the datacat_fragment can't load it's data_from a
    # file on the agents disk
    datacat_fragment { "hostgroups from yaml file":
        target => '/etc/nagios/objects/hostgroups.cfg',
        data_from => '/etc/nagios/build/hostgroups.yaml',
    }
