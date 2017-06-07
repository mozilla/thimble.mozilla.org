# apt

#### Table of Contents


2. [Module Description - What the module does and why it is useful](#module-description)
3. [Setup - The basics of getting started with apt](#setup)
    * [What apt affects](#what-apt-affects)
    * [Beginning with apt](#beginning-with-apt)
4. [Usage - Configuration options and additional functionality](#usage)
    * [Add GPG keys](#add-gpg-keys)
    * [Prioritize backports](#prioritize-backports)
    * [Update the list of packages](#update-the-list-of-packages)
    * [Pin a specific release](#pin-a-specific-release)
    * [Add a Personal Package Archive repository](#add-a-personal-package-archive-repository)
    * [Configure Apt from Hiera](#configure-apt-from-hiera)
    * [Replace the default sources.list file](#replace-the-default-sourceslist-file)
5. [Reference - An under-the-hood peek at what the module is doing and how](#reference)
    * [Classes](#classes)
    * [Defined Types](#defined-types)
    * [Types](#types)
    * [Facts](#facts)
6. [Limitations - OS compatibility, etc.](#limitations)
7. [Development - Guide for contributing to the module](#development)

## Module Description

The apt module lets you use Puppet to manage Apt sources, keys, and other configuration options.

Apt (Advanced Package Tool) is a package manager available on Debian, Ubuntu, and several other operating systems. The apt module provides a series of classes, defines, types, and facts to help you automate Apt package management.

**Note**: For this module to correctly autodetect which version of Debian/Ubuntu (or derivative) you're running, you need to make sure the 'lsb-release' package is installed. We highly recommend you either make this part of your provisioning layer, if you run many Debian or derivative systems, or ensure that you have Facter 2.2.0 or later installed, which will pull this dependency in for you.

## Setup

### What apt affects

* Your system's `preferences` file and `preferences.d` directory
* Your system's `sources.list` file and `sources.list.d` directory
* System repositories
* Authentication keys

**Note:** This module offers `purge` parameters which, if set to 'true', **destroy** any configuration on the node's `sources.list(.d)` and `preferences(.d)` that you haven't declared through Puppet. The default for these parameters is 'false'.

### Beginning with apt

To use the apt module with default parameters, declare the `apt` class.

```puppet
include apt
```

**Note:** The main `apt` class is required by all other classes, types, and defined types in this module. You must declare it whenever you use the module.

## Usage

### Add GPG keys

**Warning:** Using short key IDs presents a serious security issue, potentially leaving you open to collision attacks. We recommend you always use full fingerprints to identify your GPG keys. This module allows short keys, but issues a security warning if you use them.

Declare the `apt::key` class:

```puppet
apt::key { 'puppetlabs':
  id      => '47B320EB4C7C375AA9DAE1A01054B7A24BD6EC30',
  server  => 'pgp.mit.edu',
  options => 'http-proxy="http://proxyuser:proxypass@example.org:3128"',
}
```

### Prioritize backports

```puppet
class { 'apt::backports':
  pin => 500,
}
```

By default, the `apt::backports` class drops a pin file for backports, pinning it to a priority of 200. This is lower than the normal default of 500, so packages with `ensure => latest` don't get upgraded from backports without your explicit permission.

If you raise the priority through the `pin` parameter to 500, normal policy goes into effect and Apt installs or upgrades to the newest version. This means that if a package is available from backports, it and its dependencies are pulled in from backports unless you explicitly set the `ensure` attribute of the `package` resource to `installed`/`present` or a specific version.

### Update the list of packages

By default, Puppet runs `apt-get update` on the first Puppet run after you include the `apt` class, and anytime `notify  => Exec['apt_update']` occurs; i.e., whenever config files get updated or other relevant changes occur. If you set `update['frequency']` to 'always', the update runs on every Puppet run. You can also set `update['frequency']` to 'daily' or 'weekly':

```puppet
class { 'apt':
  update => {
    frequency => 'daily',
  },
}
```

### Pin a specific release

```puppet
apt::pin { 'karmic': priority => 700 }
apt::pin { 'karmic-updates': priority => 700 }
apt::pin { 'karmic-security': priority => 700 }
```

You can also specify more complex pins using distribution properties:

```puppet
apt::pin { 'stable':
  priority        => -10,
  originator      => 'Debian',
  release_version => '3.0',
  component       => 'main',
  label           => 'Debian'
}
```

To pin multiple packages, pass them to the `packages` parameter as an array or a space-delimited string.

### Add a Personal Package Archive repository

```puppet
apt::ppa { 'ppa:drizzle-developers/ppa': }
```

### Add an Apt source to `/etc/apt/sources.list.d/`

```puppet
apt::source { 'debian_unstable':
  comment  => 'This is the iWeb Debian unstable mirror',
  location => 'http://debian.mirror.iweb.ca/debian/',
  release  => 'unstable',
  repos    => 'main contrib non-free',
  pin      => '-10',
  key      => {
    'id'     => 'A1BD8E9D78F7FE5C3E65D8AF8B48AD6246925553',
    'server' => 'subkeys.pgp.net',
  },
  include  => {
    'src' => true,
    'deb' => true,
  },
}
```

To use the Puppet Labs Apt repository as a source:

```puppet
apt::source { 'puppetlabs':
  location => 'http://apt.puppetlabs.com',
  repos    => 'main',
  key      => {
    'id'     => '47B320EB4C7C375AA9DAE1A01054B7A24BD6EC30',
    'server' => 'pgp.mit.edu',
  },
},
```

### Configure Apt from Hiera

Instead of specifying your sources directly as resources, you can instead just
include the `apt` class, which will pick up the values automatically from
hiera.

```yaml
apt::sources:
  'debian_unstable':
    comment: 'This is the iWeb Debian unstable mirror'
    location: 'http://debian.mirror.iweb.ca/debian/'
    release: 'unstable'
    repos: 'main contrib non-free'
    pin: '-10'
    key:
      id: 'A1BD8E9D78F7FE5C3E65D8AF8B48AD6246925553'
      server: 'subkeys.pgp.net'
    include:
      src: true
      deb: true

  'puppetlabs':
    location: 'http://apt.puppetlabs.com'
    repos: 'main'
    key:
      id: '47B320EB4C7C375AA9DAE1A01054B7A24BD6EC30'
      server: 'pgp.mit.edu'
```

### Replace the default sources.list file

The following example replaces the default `/etc/apt/sources.list`. Along with this code, be sure to use the `purge` parameter, or you might get duplicate source warnings when running Apt.

```puppet
apt::source { "archive.ubuntu.com-${lsbdistcodename}":
  location => 'http://archive.ubuntu.com/ubuntu',
  key      => '630239CC130E1A7FD81A27B140976EAF437D05B5',
  repos    => 'main universe multiverse restricted',
}
 
apt::source { "archive.ubuntu.com-${lsbdistcodename}-security":
  location => 'http://archive.ubuntu.com/ubuntu',
  key      => '630239CC130E1A7FD81A27B140976EAF437D05B5',
  repos    => 'main universe multiverse restricted',
  release  => "${lsbdistcodename}-security"
}
 
apt::source { "archive.ubuntu.com-${lsbdistcodename}-updates":
  location => 'http://archive.ubuntu.com/ubuntu',
  key      => '630239CC130E1A7FD81A27B140976EAF437D05B5',
  repos    => 'main universe multiverse restricted',
  release  => "${lsbdistcodename}-updates"
}
 
apt::source { "archive.ubuntu.com-${lsbdistcodename}-backports":
 location => 'http://archive.ubuntu.com/ubuntu',
 key      => '630239CC130E1A7FD81A27B140976EAF437D05B5',
 repos    => 'main universe multiverse restricted',
 release  => "${lsbdistcodename}-backports"
}
```

## Reference

### Classes

#### Public Classes

* [`apt`](#class-apt)
* [`apt::backports`](#class-aptbackports)

#### Private Classes

* `apt::params`: Provides defaults for the apt module parameters.
* `apt::update`: Updates the list of available packages using `apt-get update`.

### Defined Types

* [`apt::conf`](#defined-type-aptconf)
* [`apt::key`](#defined-type-aptkey)
* [`apt::pin`](#defined-type-aptpin)
* [`apt::ppa`](#defined-type-aptppa)
* [`apt::setting`](#defined-type-aptsetting)
* [`apt::source`](#defined-type-aptsource)

### Types

* [`apt_key`](#type-apt_key)

### Facts

* `apt_updates`: The number of installed packages with available updates.

* `apt_security_updates`: The number of installed packages with available security updates.

* `apt_package_updates`: The names of all installed packages with available updates. In Facter 2.0 and later this data is formatted as an array; in earlier versions it is a comma-delimited string.

* `apt_update_last_success`: The date, in epochtime, of the most recent successful `apt-get update` run (based on the mtime of  /var/lib/apt/periodic/update-success-stamp).

* `apt_reboot_required`: Determines if a reboot is necessary after updates have been installed.

#### Class: `apt`

Main class, includes all other classes.

##### Parameters (all optional)

* `confs`: Creates new `apt::conf` resources. Valid options: a hash to be passed to the [`create_resources` function](https://docs.puppetlabs.com/references/latest/function.html#createresources). Default: {}.

* `keys`: Creates new `apt::key` resources. Valid options: a hash to be passed to the [`create_resources` function](https://docs.puppetlabs.com/references/latest/function.html#createresources). Default: {}.

* `ppas`: Creates new `apt::ppa` resources. Valid options: a hash to be passed to the [`create_resources` function](https://docs.puppetlabs.com/references/latest/function.html#createresources). Default: {}.

* `proxy`: Configures Apt to connect to a proxy server. Valid options: a hash made up from the following keys:

  * 'host': Specifies a proxy host to be stored in `/etc/apt/apt.conf.d/01proxy`. Valid options: a string containing a hostname. Default: undef.

  * 'port': Specifies a proxy port to be stored in `/etc/apt/apt.conf.d/01proxy`. Valid options: a string containing a port number. Default: '8080'.

  * 'https': Specifies whether to enable https proxies. Valid options: 'true' and 'false'. Default: 'false'.

  * 'ensure': Optional parameter. Valid options: 'file', 'present', and 'absent'. Default: 'undef'. Prefer 'file' over 'present'.

* `purge`: Specifies whether to purge any existing settings that aren't managed by Puppet. Valid options: a hash made up from the following keys:

  * 'sources.list': Specifies whether to purge any unmanaged entries from `sources.list`. Valid options: 'true' and 'false'. Default: 'false'.

  * 'sources.list.d': Specifies whether to purge any unmanaged entries from `sources.list.d`. Valid options: 'true' and 'false'. Default: 'false'.

  * 'preferences': Specifies whether to purge any unmanaged entries from `preferences`. Valid options: 'true' and 'false'. Default: 'false'.

  * 'preferences.d': Specifies whether to purge any unmanaged entries from `preferences.d`. Valid options: 'true' and 'false'. Default: 'false'.

* `settings`: Creates new `apt::setting` resources. Valid options: a hash to be passed to the [`create_resources` function](https://docs.puppetlabs.com/references/latest/function.html#createresources). Default: {}.

* `sources`: Creates new `apt::source` resources. Valid options: a hash to be passed to the [`create_resources` function](https://docs.puppetlabs.com/references/latest/function.html#createresources). Default: {}.

* `pins`: Creates new `apt::pin` resources. Valid options: a hash to be passed to the [`create_resources` function](https://docs.puppetlabs.com/references/latest/function.html#createresources). Default: {}.

* `update`: Configures various update settings. Valid options: a hash made up from the following keys:

  * 'frequency': Specifies how often to run `apt-get update`. If the exec resource `apt_update` is notified, `apt-get update` runs regardless of this value. Valid options: 'always' (at every Puppet run); 'daily' (if the value of `apt_update_last_success` is less than current epoch time minus 86400); 'weekly' (if the value of `apt_update_last_success` is less than current epoch time minus 604800); and 'reluctantly' (only if the exec resource `apt_update` is notified). Default: 'reluctantly'.

  * 'timeout': Specifies how long to wait for the update to complete before canceling it. Valid options: an integer, in seconds. Default: 300.

  * 'tries': Specifies how many times to retry the update after receiving a DNS or HTTP error. Valid options: an integer. Default: 1.

#### Class: `apt::backports`

Manages backports.

##### Parameters (all optional on Debian and Ubuntu; all required on other operating systems, except where specified)

* `key`: Specifies a key to authenticate the backports. Valid options: a string to be passed to the `id` parameter of the `apt::key` defined type, or a hash of `parameter => value` pairs to be passed to `apt::key`'s `id`, `server`, `content`, `source`, and/or `options` parameters. Defaults:

  * Debian: 'A1BD8E9D78F7FE5C3E65D8AF8B48AD6246925553'
  * Ubuntu: '630239CC130E1A7FD81A27B140976EAF437D05B5'

* `location`: Specifies an Apt repository containing the backports to manage. Valid options: a string containing a URL. Defaults:

  * Debian (squeeze): 'http://httpredir.debian.org/debian-backports'
  * Debian (other): 'http://httpredir.debian.org/debian'
  * Ubuntu: 'http://archive.ubuntu.com/ubuntu'

* `pin`: *Optional.* Specifies a pin priority for the backports. Valid options: a number or string to be passed to the `id` parameter of the `apt::pin` defined type, or a hash of `parameter => value` pairs to be passed to `apt::pin`'s corresponding parameters. Default: '200'.

* `release`: Specifies a distribution of the Apt repository containing the backports to manage. Valid options: a string containing the release, used in populating the `source.list` configuration file. Default: on Debian and Ubuntu, '${lsbdistcodename}-backports'. We recommend keeping this default, except on other operating systems.

* `repos`: Specifies a component of the Apt repository containing the backports to manage. Valid options: A string containing the repos to include, used in populating the `source.list` configuration file. Defaults:

  * Debian: 'main contrib non-free'
  * Ubuntu: 'main universe multiverse restricted'

#### Defined Type: `apt::conf`

Specifies a custom Apt configuration file.

##### Parameters

* `content`: *Required, unless `ensure` is set to 'absent'.* Directly supplies content for the configuration file. Valid options: a string. Default: undef.

* `ensure`: Specifies whether the configuration file should exist. Valid options: 'present' and 'absent'. Default: 'present'.

* `priority`: *Optional.* Determines the order in which Apt processes the configuration file. Files with lower priority numbers are loaded first. Valid options: a string containing an integer. Default: '50'.

* `notify_update`: *Optional.* Specifies whether to trigger an `apt-get update` run. Valid options: 'true' and 'false'. Default: 'true'.

#### Defined Type: `apt::key`

Manages the GPG keys that Apt uses to authenticate packages.

The `apt::key` defined type makes use of the `apt_key` type, but includes extra functionality to help prevent duplicate keys.

##### Parameters (all optional)

* `content`: Supplies the entire GPG key. Useful in case the key can't be fetched from a remote location and using a file resource is inconvenient. Valid options: a string. Default: undef.

* `ensure`: Specifies whether the key should exist. Valid options: 'present' and 'absent'. Default: 'present'.

* `id`: Specifies a GPG key to authenticate Apt package signatures. Valid options: a string containing a key ID (8 or 16 hexadecimal characters, optionally prefixed with "0x") or a full key fingerprint (40 hexadecimal characters). Default: $title.

* `options`: Passes additional options to `apt-key adv --keyserver-options`. Valid options: a string. Default: undef.

* `source`: Specifies the location of an existing GPG key file to copy. Valid options: a string containing a URL (ftp://, http://, or https://) or an absolute path. Default: undef.

* `server`: Specifies a keyserver to provide the GPG key. Valid options: a string containing a domain name or a full URL (http://, https://, or hkp://). Default: 'keyserver.ubuntu.com'.

* `key`: Specifies a GPG key to authenticate Apt package signatures. Valid options: a string containing a key ID (8 or 16 hexadecimal characters, optionally prefixed with "0x") or a full key fingerprint (40 hexadecimal characters). Default: undef. **Note** This parameter is deprecated and will be removed in a future release.

* `key_content`: Supplies the entire GPG key. Useful in case the key can't be fetched from a remote location and using a file resource is inconvenient. Valid options: a string. Default: undef. **Note** This parameter is deprecated and will be removed in a future release.

* `key_source`: Specifies the location of an existing GPG key file to copy. Valid options: a string containing a URL (ftp://, http://, or https://) or an absolute path. Default: undef. **Note** This parameter is deprecated and will be removed in a future release.

* `key_server`: Specifies a keyserver to provide the GPG key. Valid options: a string containing a domain name or a full URL (http://, https://, or hkp://). Default: 'keyserver.ubuntu.com'. **Note** This parameter is deprecated and will be removed in a future release.

* `key_options`: Passes additional options to `apt-key adv --keyserver-options`. Valid options: a string. Default: undef. **Note** This parameter is deprecated and will be removed in a future release.

#### Defined Type: `apt::pin`

Manages Apt pins. Does not trigger an `apt-get update` run.

**Note:** For context on these parameters, we recommend reading the man page ['apt_preferences(5)'](http://linux.die.net/man/5/apt_preferences)

##### Parameters (all optional)

* `codename`: Specifies the distribution (lsbdistcodename) of the Apt repository. Valid options: a string. Default: ''.

* `component`: Names the licensing component associated with the packages in the directory tree of the Release file. Valid options: a string. Default: ''.

* `ensure`: Specifies whether the pin should exist. Valid options: 'file', 'present', and 'absent'. Default: 'present'.

* `explanation`: Supplies a comment to explain the pin. Valid options: a string. Default: "${caller_module_name}: ${name}".

* `label`: Names the label of the packages in the directory tree of the Release file. Valid options: a string (most commonly, 'debian'). Default: ''.

* `order`: Determines the order in which Apt processes the pin file. Files with lower order numbers are loaded first. Valid options: an integer. Default: 50.

* `origin`: Tells Apt to prefer packages from the specified server. Valid options: a string containing a hostname. Default: ''.

* `originator`: Names the originator of the packages in the directory tree of the Release file. Valid options: a string (most commonly, 'debian'). Default: ''.

* `packages`: Specifies which package(s) to pin. Valid options: a string or an array. Default: '*'.

* `priority`: Sets the priority of the package. If multiple versions of a given package are available, `apt-get` installs the one with the highest priority number (subject to dependency constraints). Valid options: an integer. Default: 0.

* `release`: Tells Apt to prefer packages that support the specified release. Typical values include 'stable', 'testing', and 'unstable' Valid options: a string. Default: ''.

* `release_version`: Tells Apt to prefer packages that support the specified operating system release version (e.g., Debian release version 7). Valid options: a string. Default: ''.

* `version`: Tells Apt to prefer a specified package version or version range. Valid options: a string. Default: ''.

#### Defined Type: `apt::ppa`

Manages PPA repositories using `add-apt-repository`. Not supported on Debian.

##### Parameters (all optional, except where specified)

* `ensure`: Specifies whether the PPA should exist. Valid options: 'present' and 'absent'. Default: 'present'.

* `options`: Supplies options to be passed to the `add-apt-repository` command. Valid options: a string. Defaults:

  * Lucid: undef
  * All others: '-y'

* `package_manage`: Specifies whether Puppet should manage the package that provides `apt-add-repository`. Valid options: 'true' and 'false'. Default: 'false'.

* `package_name`: Names the package that provides the `apt-add-repository` command. Valid options: a string. Defaults:

  * Lucid and Precise: 'python-software-properties'
  * Trusty and newer: 'software-properties-common'
  * All others: 'python-software-properties'

* `release`: *Optional if lsb-release is installed (unless you're using a different release than indicated by lsb-release, e.g., Linux Mint).* Specifies the operating system of your node. Valid options: a string containing a valid LSB distribution codename. Default: "$lsbdistcodename".

#### Defined Type: `apt::setting`

Manages Apt configuration files.

##### Parameters

* `content`: *Required, unless `source` is set.* Directly supplies content for the configuration file. Cannot be used in combination with `source`. Valid options: see the `content` attribute of [Puppet's native `file` type](https://docs.puppetlabs.com/references/latest/type.html#file-attribute-content). Default: undef.

* `ensure`: Specifies whether the file should exist. Valid options: 'present', 'absent', and 'file'. Default: 'file'.

* `notify_update`: *Optional.* Specifies whether to trigger an `apt-get update` run. Valid options: 'true' and 'false'. Default: 'true'.

* `priority`: *Optional.* Determines the order in which Apt processes the configuration file. Files with higher priority numbers are loaded first. Valid options: an integer or zero-padded integer. Default: 50.

* `source`: *Required, unless `content` is set.* Specifies a source file to supply the content of the configuration file. Cannot be used in combination with `content`. Valid options: see the `source` attribute of [Puppet's native `file` type](https://docs.puppetlabs.com/references/latest/type.html#file-attribute-source). Default: undef.

#### Defined Type: `apt::source`

Manages the Apt sources in `/etc/apt/sources.list.d/`.

##### Parameters (all optional, except where specified)

* `allow_unsigned`: Specifies whether to authenticate packages from this release, even if the Release file is not signed or the signature can't be checked. Valid options: 'true' and 'false'. Default: 'false'.

* `architecture`: Tells Apt to only download information for specified architectures. Valid options: a string containing one or more architecture names, separated by commas (e.g., 'i386' or 'i386,alpha,powerpc'). Default: undef (if unspecified, Apt downloads information for all architectures defined in the Apt::Architectures option).

* `comment`: Supplies a comment for adding to the Apt source file. Valid options: a string. Default: $name.

* `ensure`: Specifies whether the Apt source file should exist. Valid options: 'present' and 'absent'. Default: 'present'.

* `key`: Creates a declaration of the apt::key defined type. Valid options: a string to be passed to the `id` parameter of the `apt::key` defined type, or a hash of `parameter => value` pairs to be passed to `apt::key`'s `id`, `server`, `content`, `source`, and/or `options` parameters. Default: undef.

* `include`: Configures include options. Valid options: a hash of available keys. Default: {}. Available keys are:

  * 'deb' - Specifies whether to request the distribution's compiled binaries. Valid options: 'true' and 'false'. Default: 'true'.

  * 'src' - Specifies whether to request the distribution's uncompiled source code. Valid options: 'true' and 'false'. Default: 'false'.

* `location`: *Required, unless `ensure` is set to 'absent'.* Specifies an Apt repository. Valid options: a string containing a repository URL. Default: undef.

* `pin`: Creates a declaration of the apt::pin defined type. Valid options: a number or string to be passed to the `id` parameter of the `apt::pin` defined type, or a hash of `parameter => value` pairs to be passed to `apt::pin`'s corresponding parameters. Default: undef.

* `release`: Specifies a distribution of the Apt repository. Valid options: a string. Default: "$lsbdistcodename".

  * `repos`: Specifies a component of the Apt repository. Valid options: a string. Default: 'main'.

* `include_deb`: Specify whether to request the distrubution's compiled binaries. Valid options: 'true' and 'false'. Default: undef. **Note**: This parameter is deprecated and will be removed in future versions of the module.

* `include_src`: Specifies whether to request the distribution's uncompiled source code. Valid options: 'true' and 'false'. Default: undef. **Note**: This parameter is deprecated and will be removed in future versions of the module.

* `required_packages`: Installs packages required for this Apt source via an exec. Default: 'false'. **Note**: This parameter is deprecated and will be removed in future versions of the module.

* `key_content`: Specifies the content to be passed to `apt::key`. Default: undef. **Note**: This parameter is deprecated and will be removed in future versions of the module.

* `key_server`: Specifies the server to be passed to `apt::key`. Default: undef. **Note**: This parameter is deprecated and will be removed in future versions of the module.

* `key_source`: Specifies the source to be passed to `apt::key`. Default: undef. **Note**: This parameter is deprecated and will be removed in future versions of the module.

* `trusted_source`: Specifies whether to authenticate packages from this release, even if the Release file is not signed or the signature can't be checked. Valid options: 'true' and 'false'. Default: undef. This parameter is **deprecated** and will be removed in a future version of the module.

* `notify_update`: *Optional.* Specifies whether to trigger an `apt-get update` run. Valid options: 'true' and 'false'. Default: 'true'.

#### Type: `apt_key`

Manages the GPG keys that Apt uses to authenticate packages.

**Note:** In most cases, we recommend using the `apt::key` defined type. It makes use of the `apt_key` type, but includes extra functionality to help prevent duplicate keys.

##### Parameters (all optional)

* `content`: Supplies the entire GPG key. Useful in case the key can't be fetched from a remote location and using a file resource is inconvenient. Cannot be used in combination with `source`. Valid options: a string. Default: undef.

* `options`: Passes additional options to `apt-key adv --keyserver-options`. Valid options: a string. Default: undef.

* `server`: Specifies a keyserver to provide Puppet's GPG key. Valid options: a string containing a domain name or a full URL. Default: 'keyserver.ubuntu.com'.

* `source`: Specifies the location of an existing GPG key file to copy. Cannot be used in combination with `content`. Valid options: a string containing a URL (ftp://, http://, or https://) or an absolute path. Default: undef.

## Limitations

This module is tested and officially supported on Debian 6 and 7 and Ubuntu 10.04, 12.04, and 14.04. Testing on other platforms has been light and cannot be guaranteed.

This module is not designed to be split across [run stages](https://docs.puppetlabs.com/puppet/latest/reference/lang_run_stages.html).

### Adding new sources or PPAs

If you are adding a new source or PPA and trying to install packages from the new source or PPA on the same Puppet run, your `package` resource should depend on `Class['apt::update']`, in addition to depending on the `Apt::Source` or the `Apt::Ppa`. You can also add [collectors](https://docs.puppetlabs.com/puppet/latest/reference/lang_collectors.html) to ensure that all packages happen after `apt::update`, but this can lead to dependency cycles and has implications for [virtual resources](https://docs.puppetlabs.com/puppet/latest/reference/lang_collectors.html#behavior).

```puppet
Class['apt::update'] -> Package <| provider == 'apt' |>
```

## Development
Puppet Labs modules on the Puppet Forge are open projects, and community contributions are essential for keeping them great. We can't access the huge number of platforms and myriad hardware, software, and deployment configurations that Puppet is intended to serve. We want to keep it as easy as possible to contribute changes so that our modules work in your environment. There are a few guidelines that we need contributors to follow so that we can have a chance of keeping on top of things.

For more information, see our [module contribution guide.](https://docs.puppetlabs.com/forge/contributing.html)

To see who's already involved, see the [list of contributors.](https://github.com/puppetlabs/puppetlabs-apt/graphs/contributors)
