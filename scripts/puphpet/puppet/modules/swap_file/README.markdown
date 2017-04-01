# swap_file

[![Puppet
Forge](http://img.shields.io/puppetforge/v/petems/swap_file.svg)](https://forge.puppetlabs.com/petems/swap_file) [![Build
Status](https://secure.travis-ci.org/petems/petems-swap_file.png)](http://travis-ci.org/petems/petems-swap_file) [![Puppet Forge
Downloads](http://img.shields.io/puppetforge/dt/petems/swap_file.svg)](https://forge.puppetlabs.com/petems/swap_file) [![Puppet Forge
Endorsement](https://img.shields.io/puppetforge/e/petems/swap_file.svg)](https://forge.puppetlabs.com/petems/swap_file)

####Table of Contents

1. [Overview](#overview)
2. [Module Description ](#module-description)
3. [Setup](#setup)
    * [What swap_file affects](#what-swap_file-affects)
4. [Usage](#usage)
5. [Limitations](#limitations)
6. [Upgrading from 1.0.1 Release](#upgrading-from-101-release)
7. [Development](#development)

##Overview

Manage [swap files](http://en.wikipedia.org/wiki/Paging) for your Linux environments. This is based on the gist by @Yggdrasil, with a few changes and added specs.

##Setup

###What swap_file affects

* Creating a swap-file on disk. This uses `dd` by default, but can use `fallocate` optionally for performance reasons. **Note: Using fallocate to create a ZFS file system will fail: https://bugzilla.redhat.com/show_bug.cgi?id=1129205**
* Swapfiles on the system
* Any mounts of swapfiles

##Usage

The simplest use of the module is this:

```puppet
swap_file::files { 'default':
  ensure   => present,
}
```

By default, the module it will:

* create a file using /bin/dd at `/mnt/swap.1` with the default size taken from the `$::memorysize` fact in megabytes (eg. 8GB RAM will create an 8GB swap file)
* A `mount` for the swapfile created

For a custom setup, you can do something like this:

```puppet
swap_file::files { 'tmp file swap':
  ensure    => present,
  swapfile  => '/tmp/swapfile',
  add_mount => false,
}
```

To use `fallocate` for swap file creation instead of `dd`:

```puppet
swap_file::files { 'tmp file swap':
  ensure    => present,
  swapfile  => '/tmp/swapfile',
  cmd       => 'fallocate',
}
```

To remove a prexisting swap, you can use ensure absent:

```puppet
swap_file::files { 'tmp file swap':
  ensure   => absent,
}
```

### hiera
You can also use hiera to call this module and set the configuration.

The simplest use of the module with hiera is this:

```yaml
classes:
  - swap_file

swap_file::files:
  'default':
    ensure: 'present'
```

This hiera setup will create a file using /bin/dd atr `/mnt/swap.1` with the default size taken from the `$::memorysize` fact and add a  `mount` resource for it.

You can use all customizations mentioned above in hiera like this:

```yaml
classes:
  - swap_file

swap_file::files:
  'custom setup':
    ensure: 'present'
    swapfile: '/tmp/swapfile.custom'
    add_mount: false
  'use fallocate':
    swapfile: '/tmp/swapfile.fallocate'
    cmd: 'fallocate'
  'remove swap file'
    ensure: 'absent'
    swapfile: '/tmp/swapfile.old'
```

This hiera config will respectively:
* create a file `/tmp/swapfile.custom` using /bin/dd with the default size taken from the `$::memorysize` fact without creating a `mount` for it.
* create a file `/tmp/swapfile.fallocate` using /usr/bin/fallocate with the default size taken from the `$::memorysize` fact and creating a `mount` for it.
* deactivates the swapfile `/tmp/swapfile.old`, deletes it and removes the `mount`.

Set `$files_hiera_merge` to `true` to merge all found instances of `swap_file::files` in Hiera. This is useful for specifying swap files at different levels of the hierachy and having them all included in the catalog.

##Upgrading from 1.0.1 Release

Previously you would create swapfiles with the `swap_file` class:

```puppet
class { 'swap_file':
  ensure => 'present',
}
```

However, this had many problems, such as not being able to declare more than one swap_file because of duplicate class errors.
Since 2.x.x the swapfiles are created by a defined type instead. The `swap_file` class is now a wrapper and can handle multiple swap_files.

You can now use:

```puppet
class { 'swap_file':
  files => {
    'freetext resource name' => {
      ensure => 'present',
    },
  },
}
```

You can also safely declare mutliple swap file definitions:

```puppet
class { 'swap_file':
  files => {
    'swapfile' => {
      ensure => 'present',
    },
    'use fallocate' => {
      swapfile => '/tmp/swapfile.fallocate',
      cmd      => 'fallocate',
    },
    'remove swap file' => {
      ensure   => 'absent',
      swapfile => '/tmp/swapfile.old',
    },
  },
}
```

##Limitations

Primary support is for Debian and RedHat, but should work on all Linux flavours.

Right now there is no BSD support, but I'm planning on adding it in the future

##Development

Follow the CONTRIBUTING guidelines! :)
