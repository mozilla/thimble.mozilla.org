# Puppet Redis

## Build status

[![Build Status](https://travis-ci.org/arioch/puppet-redis.png?branch=master)](https://travis-ci.org/arioch/puppet-redis)

## Example usage

### Standalone

    class { 'redis':
    }

### Master node

    class { 'redis':
      bind        => '10.0.1.1';
      #masterauth  => 'secret';
    }

### Slave node

    class { 'redis':
      bind        => '10.0.1.2',
      slaveof     => '10.0.1.1 6379';
      #masterauth  => 'secret';
    }

### Redis 3.0 Clustering

    class { 'redis':
      bind                 => '10.0.1.2',
      appendonly           => true,
      cluster_enabled      => true,
      cluster_config_file  => 'nodes.conf',
      cluster_node_timeout => 5000,
    }

### Manage repositories

Disabled by default but if you really want the module to manage the required
repositories you can use this snippet:

    class { 'redis':
      manage_repo => true,
    }

On Ubuntu, "chris-lea/redis-server" ppa repo will be added. You can change it by using ppa_repo parameter:

    class { 'redis':
      manage_repo => true,
      ppa_repo    => 'ppa:rwky/redis',
    }
### Redis Sentinel

Optionally install and configuration a redis-sentinel server.

With default settings:

    class { 'redis::sentinel':}

With adjustments:

    class { 'redis::sentinel':
      master_name => 'cow',
      redis_host  => '192.168.1.5',
      failover_timeout => 30000,
    }

## Unit testing

Plain RSpec:

    $ rake spec

Using bundle:

    $ bundle exec rake spec

Test against a specific Puppet or Facter version:

    $ PUPPET_VERSION=3.2.1  bundle update && bundle exec rake spec
    $ PUPPET_VERSION=2.7.19 bundle update && bundle exec rake spec
    $ FACTER_VERSION=1.6.8  bundle update && bundle exec rake spec

## Contributing

* Fork it
* Create a feature branch (`git checkout -b my-new-feature`)
* Run rspec tests (`bundle exec rake spec`)
* Commit your changes (`git commit -am 'Added some feature'`)
* Push to the branch (`git push origin my-new-feature`)
* Create new Pull Request
