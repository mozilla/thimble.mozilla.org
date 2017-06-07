puppet-nodejs
=============

[![Build
Status](https://travis-ci.org/willdurand/puppet-nodejs.png?branch=master)](https://travis-ci.org/willdurand/puppet-nodejs)

This module allows you to install [Node.js](http://nodejs.org/) and
[NPM](https://npmjs.org/). This module is published on the Puppet Forge as
[willdurand/nodejs](http://forge.puppetlabs.com/willdurand/nodejs).


Installation
------------

### Manual installation

This modules depends on
[puppetlabs/stdlib](https://github.com/puppetlabs/puppetlabs-stdlib) and [maestrodev/puppet-wget](https://github.com/maestrodev/puppet-wget).
So all repositories have to be checked out:

```bash
git clone git://github.com/willdurand/puppet-nodejs.git modules/nodejs
git clone git://github.com/puppetlabs/puppetlabs-stdlib.git modules/stdlib
git clone git://github.com/maestrodev/puppet-wget.git modules/wget
```

For Redhat based OS, the following are (typical) additional requirements:

```bash
git clone git://github.com/treydock/puppet-gpg_key.git modules/gpg_key
```

### Puppet Module Tool:

    puppet module install willdurand/nodejs

### Librarian-puppet:

    mod 'willdurand/nodejs', '1.x.x'

Usage
-----

There are a few ways to use this puppet module. The easiest one is just using the class definition:

```puppet
class { 'nodejs':
  version => 'v0.10.25',
}
```
This will compile and install Node.js version `v0.10.25` to your machine. `node` and `npm` will be available in your `$PATH` via `/usr/local/node/node-default/bin` so you can just start using `node`.

Shortcuts are provided to easily install the `latest` or `stable` release by setting the `version` parameter to `latest` or `stable`. It will automatically look for the last release available on http://nodejs.org.

```puppet
class { 'nodejs':
  version => 'stable',
}
```

### Setup using the pre-built installer

To use the pre-built installer version provided via http://nodejs.org/download you have to set `make_install` to `false`

```puppet
class { 'nodejs':
  version      => 'stable',
  make_install => false,
}
```

### Setup multiple versions of Node.js

If you need more than one installed version of Node.js on your machine, you can just do it using the `nodejs::install` puppet define.

```puppet
nodejs::install { 'v0.10.17':
  version => 'v0.10.17',
}
nodejs::install { 'v0.10.25':
  version => 'v0.10.25',
}
```

This snippet will install version `v0.10.17` and `v0.10.25` on your machine. Keep in mind that a Node.js version installed via `nodejs::install` will provide only versioned binaries inside `/usr/local/bin`!

```
/usr/local/bin/node-v0.10.17
/usr/local/bin/node-v0.10.25
```

By default, this module creates a symlink for the node binary (and npm) with Node.js version appended into `/usr/local/bin` e.g. `/usr/local/bin/node-v0.10.17`.
All parameters available in the `class` definition are also available for `nodejs::install`.

NPM symlinks cannot be created since every npm instance would use the default node interpreter which may cause errors.
If you'd like to use another npm interpreter, please do something like this:

```
/usr/local/node/node-vx.x/bin/node /usr/local/node/node-vx.x/bin/npm run your_command
```

For 2.x it is planned to use NVM and refactor the whole nodejs installer (See [#119](https://github.com/willdurand/puppet-nodejs/issues/119)

It is also possible to remove those versions again:

```puppet
::nodejs::install { 'node-v5.4':
  ensure  => absent,
  version => 'v5.4.1',
}
```

After the run the directory __/usr/local/node/node-v5.4.1__ has been purged.
The link __/usr/local/bin/node-v5.4.1__ is also purged.

If the instance is the default one, an error will be thrown.

__Note:__ It is not possible to install and uninstall an instance in the same run.
__Note:__ The default instance of nodejs cannot be removed. In this case an error will be raised.

### Configuring $NODE_PATH

The environment variable $NODE_PATH can be configured using the `init` manifest:

```puppet
class { '::nodejs':
  version   => 'latest',
  node_path => '/your/custom/node/path',
}
```

It is not possible to adjust a $NODE_PATH through ``::nodejs::install``.

### Binary path

`node` and `npm` are linked to `/usr/local/bin` to be available in your system `$PATH` by default. To link those binaries to e.g `/bin`, just set the parameter `target_dir`.

```puppet
class { 'nodejs':
  version    => 'stable',
  target_dir => '/bin',
}
```

### NPM

Also, this module installs [NPM](https://npmjs.org/) by default. Since versions `v0.6.3` of Node.js `npm` is included in every installation! For older versions, you can set parameter `with_npm => false` to not install `npm`.


### NPM Provider

This module adds a new provider: `npm`. You can use it as usual:

```puppet
package { 'express':
  provider => npm
}
```

Note: When deploying a new machine without nodejs already installed, your npm package definition requires the nodejs class:

```puppet
class { 'nodejs':
  version => 'stable'
}

package { 'express':
  provider => 'npm',
  require  => Class['nodejs']
}
```

### NPM installer

The nodejs installer can be used if a npm package should not be installed globally, but in a certain directory.

There are two approaches how to use this feature:

#### Installing a single package into a directory

```puppet
::nodejs::npm { 'npm-webpack':
  ensure       => present, # absent would uninstall this package
  pkg_name     => 'webpack',
  version      => 'x.x', # optional
  install_opt  => '-x -y -z', # options passed to the "npm install" cmd, optional
  remove_opt   => '-x -y -z', # options passed to the "npm remove" cmd (in case of ensure => absent), optional
  exec_as_user => 'vagrant',  # exec user, optional
  directory    => '/target/directory', # target directory
}
```

This would install the package ``webpack`` into ``/target/directory`` with version ``x.x``.

#### Executing a ``package.json`` file

```puppet
::nodejs::npm { 'npm-install-dir':
  list         => true, # flag to tell puppet to execute the package.json file
  directory    => '/target',
  exec_as_user => 'vagrant',
  install_opt  => '-x -y -z',
}
```

### Proxy

When your puppet agent is behind a web proxy, export the `http_proxy` environment variable:

```bash
export http_proxy=http://myHttpProxy:8888
```

Running the tests
-----------------

Install the dependencies using [Bundler](http://gembundler.com):

    BUNDLE_GEMFILE=.gemfile bundle install

Run the following command:

    BUNDLE_GEMFILE=.gemfile bundle exec rake test


Authors
-------

* William Durand <william.durand1@gmail.com>
* Johannes Graf ([@grafjo](https://github.com/grafjo))


License
-------

puppet-nodejs is released under the MIT License. See the bundled LICENSE file
for details.
