#GnuPG puppet module

####Table of Contents

1. [Overview](##overview)
2. [Installation](##Installation)
3. [Usage - Configuration options and additional functionality](@#usage)
4. [Reference - An under-the-hood peek at what the module is doing and how](##reference)
5. [Limitations - OS compatibility, etc.](##limitations)
6. [Development - Guide for contributing to the module](##development)
7. [License](##license)

##Overview

Install GnuPG on Ubuntu/Debian/RedHat/CentOS/Amazon AMI and manage users public keys.

Tested with Tavis CI

NOTE: For puppet 2.7.x supported module please use version 0.X.X

[![Build Status](https://travis-ci.org/n1tr0g/golja-gnupg.png)](https://travis-ci.org/n1tr0g/golja-gnupg) [![Puppet Forge](http://img.shields.io/puppetforge/v/golja/gnupg.svg)](https://forge.puppetlabs.com/golja/gnupg)

##Installation

     $ puppet module install golja/gnupg

##Usage

####Install GnuPG package

    include '::gnupg'

####Add public key 20BC0A86 from PGP server from hkp://pgp.mit.edu/ to user root

```puppet
gnupg_key { 'hkp_server_20BC0A86':
  ensure     => present,
  key_id     => '20BC0A86',
  user       => 'root',
  key_server => 'hkp://pgp.mit.edu/',
  key_type   => public,
}
```

####Add public key D50582E6 from standard http URI to user foo

```puppet
gnupg_key { 'jenkins_foo_key':
  ensure     => present,
  key_id     => 'D50582E6',
  user       => 'foo',
  key_source => 'http://pkg.jenkins-ci.org/debian/jenkins-ci.org.key',
  key_type   => public,
}
```

####Add public key D50582E6 from puppet fileserver to user foo

```puppet
gnupg_key { 'jenkins_foo_key':
  ensure     => present,
  key_id     => 'D50582E6',
  user       => 'foo',
  key_source => 'puppet:///modules/gnupg/D50582E6.key',
  key_type   => public,
}
```

####Add public key D50582E6 from puppet fileserver to user bar via a string value

```puppet
gnupg_key { 'jenkins_foo_key':
  ensure      => present,
  key_id      => 'D50582E6',
  user        => 'bar',
  key_content => '-----BEGIN BROKEN PUBLIC KEY BLOCK-----...',
  key_type    => public,
}
```
*Note*: You should use hiera lookup to get the key content

####Remove public key 20BC0A86 from user root

```puppet
gnupg_key {'root_remove':
  ensure   => absent,
  key_id   => '20BC0A86',
  user     => 'root',
  key_type => public,
}
```

###Remove both private and public key 20BC0A66

```puppet
gnupg_key {'root_remove':
  ensure   => absent,
  key_id   => '20BC0A66',
  user     => 'root',
  key_type => both,
}
```

##Reference

###Classes

####gnupg

#####`package_ensure`

Valid value present/absent. In most cases you should never uninstall this package,
because most of the modern Linux distros rely on gnupg for package verification, etc
Default: present

#####`package_name`

Name of the GnuPG package. Default value determined by $::osfamily/$::operatingsystem facts

####gnupg_key

#####`ensure`

**REQUIRED** - Valid value present/absent

#####`user`

**REQUIRED** - System username for who to store the public key. Also define the location of the 
pubring (default ${HOME}/.gnupg/)

#####`key_id`

**REQUIRED** - Key ID. Usually the traditional 8-character key ID. Also accepted the
long more accurate (but  less  convenient) 16-character key ID. Accept only hexadecimal
values.

#####`key_source`

**REQUIRED** if `key_server` or `key_content` is not defined and `ensure` is present.
A source file containing PGP key. Values can be URIs pointing to remote files,
or fully qualified paths to files available on the local system.

The available URI schemes are *puppet*, *https*, *http* and *file*. *Puppet*
URIs will retrieve files from Puppet's built-in file server, and are
usually formatted as:

puppet:///modules/name_of_module/filename

#####`key_server`

**REQUIRED** if `key_source` or `key_content` is not defined and `ensure` is present.

PGP key server from where to retrieve the public key. Valid URI schemes are
*http*, *https*, *ldap* and *hkp*.

#####`key_content`

**REQUIRED** if `key_server` or `key_source` is not defined and `ensure` is present.

Provide the content of the key as a string. This is useful when the key is stored as a
hiera property and the consumer doesn't want to have to write that content to a file
before the gnupg_key resource executes.


#####`key_type`

**OPTIONAL** - key type. Valid values (public|private|both). Default: public

PGP key server from where to retrieve the public key. Valid URI schemes are
*http*, *https*, *ldap* and *hkp*.


### Tests

There are two types of tests distributed with the module. Unit tests with rspec-puppet and system tests using rspec-system or beaker.

For unit testing, make sure you have:

* rake
* bundler

Install the necessary gems:

    bundle install --path=vendor

And then run the unit tests:

    bundle exec rake spec


If you want to run the system tests, make sure you also have:

* vagrant > 1.3.x
* Virtualbox > 4.2.10

Then run the tests using:

    bundle exec rake spec:system

To run the tests on different operating systems, see the sets available in .nodeset.yml and run the specific set with the following syntax:

    RSPEC_SET=debian-607-x64 bundle exec rake spec:system

Alernatively you can run beaker tests using:

    bundle exec rake beaker

##Limitations

This module has been tested on:

* Debian 6/7
* Ubuntu 12+
* RedHat 5/6/7
* CentOS 5/6/7
* Amazon AMI

##Development

Please see CONTRIBUTING.md

## License

See LICENSE file

