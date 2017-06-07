[![Build Status](https://travis-ci.org/fiddyspence/puppet-sysctl.png?branch=master)](https://travis-ci.org/fiddyspence/puppet-sysctl)

This is a puppet module to edit Linux kernel params using sysctl under the running kernel using a native type/provider.  It modifies both the running kernel, and optionally will persist settings in /etc/sysctl.conf

EXAMPLE USAGE:

    # puppet resource sysctl net.ipv4.ip_local_port_range permanent=no value="32768"$'\t'"61000"
    notice: /Sysctl[net.ipv4.ip_local_port_range]/value: value changed '32768 61001' to '32768 61000'
    sysctl { 'net.ipv4.ip_local_port_range':
      ensure    => 'present',
      permanent => 'yes',
      value     => '32768 61000',
    }

There are some things to be aware of - namely:

First - by default the available params are available on your platform by running sysctl -a

Running puppet resource will give you available kernel tunables in the Puppet DSL

By default, we use /etc/sysctl.conf - to alter the target file) use
    path => '/etc/adifferentsysctl.conf'

To change sysctl.conf use

    permanent => yes|no

You can stick pretty much any string in value, note for multiwords use a single space - the provider squashes multiple spaces between single values to a single space.

License:

See LICENSE file

Changelog:

 - 9th July 2014 - adding Travis CI
