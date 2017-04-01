# Elasticsearch Puppet Module

[![Build Status](https://travis-ci.org/elastic/puppet-elasticsearch.svg?branch=master)](https://travis-ci.org/elastic/puppet-elasticsearch)
[![Puppet Forge endorsed](https://img.shields.io/puppetforge/e/elasticsearch/elasticsearch.svg)](https://forge.puppetlabs.com/elasticsearch/elasticsearch)
[![Puppet Forge Version](https://img.shields.io/puppetforge/v/elasticsearch/elasticsearch.svg)](https://forge.puppetlabs.com/elasticsearch/elasticsearch)
[![Puppet Forge Downloads](https://img.shields.io/puppetforge/dt/elasticsearch/elasticsearch.svg)](https://forge.puppetlabs.com/elasticsearch/elasticsearch)

#### Table of Contents

1. [Module description - What the module does and why it is useful](#module-description)
2. [Setup - The basics of getting started with Elasticsearch](#setup)
  * [The module manages the following](#the-module-manages-the-following)
  * [Requirements](#requirements)
3. [Usage - Configuration options and additional functionality](#usage)
4. [Advanced features - Extra information on advanced usage](#advanced-features)
5. [Reference - An under-the-hood peek at what the module is doing and how](#reference)
6. [Limitations - OS compatibility, etc.](#limitations)
7. [Development - Guide for contributing to the module](#development)
8. [Support - When you need help with this module](#support)

## Module description

This module sets up [Elasticsearch](https://www.elastic.co/overview/elasticsearch/) instances with additional resource for plugins, templates, and more.

This module has been tested against all versions of ES 1.x and 2.x.

## Setup

### The module manages the following

* Elasticsearch repository files.
* Elasticsearch package.
* Elasticsearch configuration file.
* Elasticsearch service.
* Elasticsearch plugins.
* Elasticsearch templates.
* Elasticsearch Shield users, roles, and certificates.

### Requirements

* The [stdlib](https://forge.puppetlabs.com/puppetlabs/stdlib) Puppet library.
* [ceritsc/yum](https://forge.puppetlabs.com/ceritsc/yum) For yum version lock.
* [richardc/datacat](https://forge.puppetlabs.com/richardc/datacat)
* [Augeas](http://augeas.net/)
* [puppetlabs-java](https://forge.puppetlabs.com/puppetlabs/java) for Java installation (optional).
* [puppetlabs-java_ks](https://forge.puppetlabs.com/puppetlabs/java_ks) for Shield certificate management (optional).

#### Repository management

When using the repository management, the following module dependencies are required:

* Debian/Ubuntu: [Puppetlabs/apt](http://forge.puppetlabs.com/puppetlabs/apt)
* OpenSuSE/SLES: [Darin/zypprepo](https://forge.puppetlabs.com/darin/zypprepo)

### Beginning with Elasticsearch

Declare the top-level `elasticsearch` class (managing repositories) and set up an instance:

```puppet
class { 'elasticsearch':
  java_install => true,
  manage_repo  => true,
  repo_version => '2.x',
}

elasticsearch::instance { 'es-01': }
```

## Usage

### Main class

Most top-level parameters in the `elasticsearch` class are set to reasonable defaults.
The following are some parameters that may be useful to override:

#### Install a specific version

```puppet
class { 'elasticsearch':
  version => '1.4.2'
}
```

Note: This will only work when using the repository.

#### Automatically restarting the service (default set to false)

By default, the module will not restart Elasticsearch when the configuration file, package, or plugins change.
This can be overridden globally with the following option:

```puppet
class { 'elasticsearch':
  restart_on_change => true
}
```

Or controlled with the more granular options: `restart_config_change`, `restart_package_change`, and `restart_plugin_change.`

#### Automatic upgrades (default set to false)

```puppet
class { 'elasticsearch':
  autoupgrade => true
}
```

#### Removal/Decommissioning

```puppet
class { 'elasticsearch':
  ensure => 'absent'
}
```

#### Install everything but disable service(s) afterwards

```puppet
class { 'elasticsearch':
  status => 'disabled'
}
```

#### API Settings

Some resources, such as `elasticsearch::template`, require communicating with the Elasticsearch REST API.
By default, these API settings are set to:

```puppet
class { 'elasticsearch':
  api_protocol            => 'http',
  api_host                => 'localhost',
  api_port                => 9200,
  api_timeout             => 10,
  api_basic_auth_username => undef,
  api_basic_auth_password => undef,
  validate_tls            => true,
}
```

Each of these can be set at the top-level `elasticsearch` class and inherited for each resource or overridden on a per-resource basis.

### Instances

This module works with the concept of instances. For service to start you need to specify at least one instance.

#### Quick setup

```puppet
elasticsearch::instance { 'es-01': }
```

This will set up its own data directory and set the node name to `$hostname-$instance_name`

#### Advanced options

Instance specific options can be given:

```puppet
elasticsearch::instance { 'es-01':
  config        => { }, # Configuration hash
  init_defaults => { }, # Init defaults hash
  datadir       => [ ], # Data directory
}
```

See [Advanced features](#advanced-features) for more information.

### Plugins

This module can help manage [a variety of plugins](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/modules-plugins.html#known-plugins).
Note that `module_dir` is where the plugin will install itself to and must match that published by the plugin author; it is not where you would like to install it yourself.

#### From an official repository

```puppet
elasticsearch::plugin { 'lmenezes/elasticsearch-kopf':
  instances => 'instance_name'
}
```

#### From a custom url

```puppet
elasticsearch::plugin { 'jetty':
  url        => 'https://oss-es-plugins.s3.amazonaws.com/elasticsearch-jetty/elasticsearch-jetty-1.2.1.zip',
  instances  => 'instance_name'
}
```

#### Using a proxy

You can also use a proxy if required by setting the `proxy_host` and `proxy_port` options:
```puppet
elasticsearch::plugin { 'lmenezes/elasticsearch-kopf',
  instances  => 'instance_name',
  proxy_host => 'proxy.host.com',
  proxy_port => 3128
}
```

Proxies that require usernames and passwords are similarly supported with the `proxy_username` and `proxy_password` parameters.

Plugin name formats that are supported include:

* `elasticsearch/plugin/version` (for official elasticsearch plugins downloaded from download.elastic.co)
* `groupId/artifactId/version` (for community plugins downloaded from maven central or OSS Sonatype)
* `username/repository` (for site plugins downloaded from github master)

#### Upgrading plugins

When you specify a certain plugin version, you can upgrade that plugin by specifying the new version.

```puppet
elasticsearch::plugin { 'elasticsearch/elasticsearch-cloud-aws/2.1.1': }
```

And to upgrade, you would simply change it to

```puppet
elasticsearch::plugin { 'elasticsearch/elasticsearch-cloud-aws/2.4.1': }
```

Please note that this does not work when you specify 'latest' as a version number.

#### ES 2.x official plugins
For the Elasticsearch commercial plugins you can refer them to the simple name.

See [Plugin installation](https://www.elastic.co/guide/en/elasticsearch/plugins/current/installation.html) for more details.

### Scripts

Installs [scripts](http://www.elastic.co/guide/en/elasticsearch/reference/current/modules-scripting.html) to be used by Elasticsearch.
These scripts are shared across all defined instances on the same host.

```puppet
elasticsearch::script { 'myscript':
  ensure => 'present',
  source => 'puppet:///path/to/my/script.groovy'
}
```

### Templates

By default templates use the top-level `elasticsearch::api_*` settings to communicate with Elasticsearch.
The following is an example of how to override these settings:

```puppet
elasticsearch::template { 'templatename':
  api_protocol            => 'https',
  api_host                => $::ipaddress,
  api_port                => 9201,
  api_timeout             => 60,
  api_basic_auth_username => 'admin',
  api_basic_auth_password => 'adminpassword',
  validate_tls            => false,
  source                  => 'puppet:///path/to/template.json',
}
```

#### Add a new template using a file

This will install and/or replace the template in Elasticsearch:

```puppet
elasticsearch::template { 'templatename':
  source => 'puppet:///path/to/template.json',
}
```

#### Add a new template using content

This will install and/or replace the template in Elasticsearch:

```puppet
elasticsearch::template { 'templatename':
  content => {
    'template' => "*",
    'settings' => {
      'number_of_replicas' => 0
    }
  }
}
```

Plain JSON strings are also supported.

```puppet
elasticsearch::template { 'templatename':
  content => '{"template":"*","settings":{"number_of_replicas":0}}'
}
```

#### Delete a template

```puppet
elasticsearch::template { 'templatename':
  ensure => 'absent'
}
```

### Bindings/Clients

Install a variety of [clients/bindings](http://www.elasticsearch.org/guide/en/elasticsearch/client/community/current/clients.html):

#### Python

```puppet
elasticsearch::python { 'rawes': }
```

#### Ruby

```puppet
elasticsearch::ruby { 'elasticsearch': }
```

### Connection Validator

This module offers a way to make sure an instance has been started and is up and running before
doing a next action. This is done via the use of the `es_instance_conn_validator` resource.
```puppet
es_instance_conn_validator { 'myinstance' :
  server => 'es.example.com',
  port   => '9200',
}
```

A common use would be for example :

```puppet
class { 'kibana4' :
  require => Es_Instance_Conn_Validator['myinstance'],
}
```

### Package installation

There are two different ways of installing Elasticsearch:

#### Repository

This option allows you to use an existing repository for package installation.
The `repo_version` corresponds with the `major.minor` version of Elasticsearch for versions before 2.x.

```puppet
class { 'elasticsearch':
  manage_repo  => true,
  repo_version => '1.4',
}
```

For 2.x versions of Elasticsearch, use `repo_version => '2.x'`.

```puppet
class { 'elasticsearch':
  manage_repo  => true,
  repo_version => '2.x',
}
```

#### Remote package source

When a repository is not available or preferred you can install the packages from a remote source:

##### http/https/ftp

```puppet
class { 'elasticsearch':
  package_url => 'https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-1.4.2.deb',
  proxy_url   => 'http://proxy.example.com:8080/',
}
```

Setting `proxy_url` to a location will enable download using the provided proxy
server.
This parameter is also used by `elasticsearch::plugin`.
Setting the port in the `proxy_url` is mandatory.
`proxy_url` defaults to `undef` (proxy disabled).

##### puppet://
```puppet
class { 'elasticsearch':
  package_url => 'puppet:///path/to/elasticsearch-1.4.2.deb'
}
```

##### Local file

```puppet
class { 'elasticsearch':
  package_url => 'file:/path/to/elasticsearch-1.4.2.deb'
}
```

### Java installation

Most sites will manage Java separately; however, this module can attempt to install Java as well.
This is done by using the [puppetlabs-java](https://forge.puppetlabs.com/puppetlabs/java) module.

```puppet
class { 'elasticsearch':
  java_install => true
}
```

Specify a particular Java package/version to be installed:

```puppet
class { 'elasticsearch':
  java_install => true,
  java_package => 'packagename'
}
```

### Service management

Currently only the basic SysV-style [init](https://en.wikipedia.org/wiki/Init) and [Systemd](http://en.wikipedia.org/wiki/Systemd) service providers are supported, but other systems could be implemented as necessary (pull requests welcome).

#### Defaults File

The *defaults* file (`/etc/defaults/elasticsearch` or `/etc/sysconfig/elasticsearch`) for the Elasticsearch service can be populated as necessary.
This can either be a static file resource or a simple key value-style  [hash](http://docs.puppetlabs.com/puppet/latest/reference/lang_datatypes.html#hashes) object, the latter being particularly well-suited to pulling out of a data source such as Hiera.

##### File source

```puppet
class { 'elasticsearch':
  init_defaults_file => 'puppet:///path/to/defaults'
}
```
##### Hash representation

```puppet
$config_hash = {
  'ES_HEAP_SIZE' => '30g',
}

class { 'elasticsearch':
  init_defaults => $config_hash
}
```

Note: `init_defaults` hash can be passed to the main class and to the instance.

## Advanced features

### Shield

[Shield](https://www.elastic.co/products/shield) users, roles, and certificates can be managed by this module.

**Note**: If you are planning to use these features, it is *highly recommended* you read the following documentation to understand the caveats and extent of the resources available to you.

#### Getting Started

Although this module can handle several types of Shield resources, you are expected to manage the plugin installation and versions for your deployment.
For example, the following manifest will install Elasticseach with a single instance running shield:

```puppet
class { 'elasticsearch':
  java_install => true,
  manage_repo  => true,
  repo_version => '1.7',
}

elasticsearch::instance { 'es-01': }

Elasticsearch::Plugin { instances => ['es-01'], }
elasticsearch::plugin { 'elasticsearch/license/latest': }
elasticsearch::plugin { 'elasticsearch/shield/latest': }
```

The following examples will assume the preceding resources are part of your puppet manifest.

#### Roles

Roles in the `esusers` realm can be managed using the `elasticsearch::shield::role` type.
For example, to create a role called `myrole`, you could use the following resource:

```puppet
elasticsearch::shield::role { 'myrole':
  privileges => {
    'cluster' => 'monitor',
    'indices' => {
      '*' => 'read'
    }
  }
}
```

This role would grant users access to cluster monitoring and read access to all indices.
See the [Shield documentation](https://www.elastic.co/guide/en/shield/index.html) for your version to determine what `privileges` to use and how to format them (the Puppet hash representation will simply be translated into yaml.)

**Note**: The Puppet provider for `esusers` has fine-grained control over the `roles.yml` file and thus will leave the default roles Shield installs in-place.
If you would like to explicitly purge the default roles (leaving only roles managed by puppet), you can do so by including the following in your manifest:

```puppet
resources { 'elasticsearch_shield_role':
  purge => true,
}
```

##### Mappings

Associating mappings with a role is done by passing an array of strings to the `mappings` parameter of the `elasticsearch::shield::role` type.
For example, to define a role with mappings using Shield >= 2.3.x style role definitions:

```puppet
elasticsearch::shield::role { 'logstash':
  mappings   => [
    'cn=group,ou=devteam',
  ],
  privileges => {
    'cluster' => 'manage_index_templates',
    'indices' => [{
      'names'      => ['logstash-*'],
      'privileges' => [
        'write',
        'delete',
        'create_index',
      ],
    }],
  },
}
```

**Note**: Observe the brackets around `indices` in the preceding role definition; which is an array of hashes per the format in Shield 2.3.x. Follow the documentation to determine the correct formatting for your version of Shield.

If you'd like to keep the mappings file purged of entries not under Puppet's control, you should use the following `resources` declaration because mappings are a separate low-level type:

```puppet
resources { 'elasticsearch_shield_role_mapping':
  purge => true,
}
```

#### Users

Users can be managed using the `elasticsearch::shield::user` type.
For example, to create a user `mysuser` with membership in `myrole`:

```puppet
elasticsearch::shield::user { 'myuser':
  password => 'mypassword',
  roles    => ['myrole'],
}
```

The `password` parameter will also accept password hashes generated from the `esusers` utility and ensure the password is kept in-sync with the Shield `users` file for all Elasticsearch instances.

```puppet
elasticsearch::shield::user { 'myuser':
  password => '$2a$10$IZMnq6DF4DtQ9c4sVovgDubCbdeH62XncmcyD1sZ4WClzFuAdqspy',
  roles    => ['myrole'],
}
```

**Note**: When using the `esusers` provider (the default for plaintext passwords), Puppet has no way to determine whether the given password is in-sync with the password hashed by Shield.
In order to work around this, the `elasticsearch::shield::user` resource has been designed to accept refresh events in order to update password values.
This is not ideal, but allows you to instruct the resource to change the password when needed.
For example, to update the aforementioned user's password, you could include the following your manifest:

```puppet
notify { 'update password': } ~>
elasticsearch::shield::user { 'myuser':
  password => 'mynewpassword',
  roles    => ['myrole'],
}
```

#### Certificates

SSL/TLS can be enabled by providing an `elasticsearch::instance` type with paths to the certificate and private key files, and a password for the keystore.

```puppet
elasticsearch::instance { 'es-01':
  ssl                  => true,
  ca_certificate       => '/path/to/ca.pem',
  certificate          => '/path/to/cert.pem',
  private_key          => '/path/to/key.pem',
  keystore_password    => 'keystorepassword',
}
```

**Note**: Setting up a proper CA and certificate infrastructure is outside the scope of this documentation, see the aforementioned Shield guide for more information regarding the generation of these certificate files.

The module will set up a keystore file for the node to use and set the relevant options in `elasticsearch.yml` to enable TLS/SSL using the certificates and key provided.

#### System Keys

Shield system keys can be passed to the module, where they will be placed into individual instance configuration directories.
This can be set at the `elasticsearch` class and inherited across all instances:

```puppet
class { 'elasticsearch':
  system_key => 'puppet:///path/to/key',
}
```

Or set on a per-instance basis:

```puppet
elasticsearch::instance { 'es-01':
  system_key => '/local/path/to/key',
}
```

### Package version pinning

The module supports pinning the package version to avoid accidental upgrades that are not done by Puppet.
To enable this feature:

```puppet
class { 'elasticsearch':
  package_pin => true,
  version     => '1.5.2',
}
```

In this example we pin the package version to 1.5.2.

### Data directories

There are 4 different ways of setting data directories for Elasticsearch.
In every case the required configuration options are placed in the `elasticsearch.yml` file.

#### Default
By default we use:

    /usr/share/elasticsearch/data/$instance_name

Which provides a data directory per instance.

#### Single global data directory

```puppet
class { 'elasticsearch':
  datadir => '/var/lib/elasticsearch-data'
}
```

Creates the following for each instance:

    /var/lib/elasticsearch-data/$instance_name

#### Multiple Global data directories

```puppet
class { 'elasticsearch':
  datadir => [ '/var/lib/es-data1', '/var/lib/es-data2']
}
```
Creates the following for each instance:
`/var/lib/es-data1/$instance_name`
and
`/var/lib/es-data2/$instance_name`.

#### Single instance data directory

```puppet
class { 'elasticsearch': }

elasticsearch::instance { 'es-01':
  datadir => '/var/lib/es-data-es01'
}
```

Creates the following for this instance:

    /var/lib/es-data-es01

#### Multiple instance data directories

```puppet
class { 'elasticsearch': }

elasticsearch::instance { 'es-01':
  datadir => ['/var/lib/es-data1-es01', '/var/lib/es-data2-es01']
}
```

Creates the following for this instance:
`/var/lib/es-data1-es01`
and
`/var/lib/es-data2-es01`.


### Main and instance configurations

The `config` option in both the main class and the instances can be configured to work together.

The options in the `instance` config hash will merged with the ones from the main class and override any duplicates.

#### Simple merging

```puppet
class { 'elasticsearch':
  config => { 'cluster.name' => 'clustername' }
}

elasticsearch::instance { 'es-01':
  config => { 'node.name' => 'nodename' }
}
elasticsearch::instance { 'es-02':
  config => { 'node.name' => 'nodename2' }
}
```

This example merges the `cluster.name` together with the `node.name` option.

#### Overriding

When duplicate options are provided, the option in the instance config overrides the ones from the main class.

```puppet
class { 'elasticsearch':
  config => { 'cluster.name' => 'clustername' }
}

elasticsearch::instance { 'es-01':
  config => { 'node.name' => 'nodename', 'cluster.name' => 'otherclustername' }
}

elasticsearch::instance { 'es-02':
  config => { 'node.name' => 'nodename2' }
}
```

This will set the cluster name to `otherclustername` for the instance `es-01` but will keep it to `clustername` for instance `es-02`

#### Configuration writeup

The `config` hash can be written in 2 different ways:

##### Full hash writeup

Instead of writing the full hash representation:

```puppet
class { 'elasticsearch':
  config                 => {
   'cluster'             => {
     'name'              => 'ClusterName',
     'routing'           => {
        'allocation'     => {
          'awareness'    => {
            'attributes' => 'rack'
          }
        }
      }
    }
  }
}
```

##### Short hash writeup

```puppet
class { 'elasticsearch':
  config => {
    'cluster' => {
      'name' => 'ClusterName',
      'routing.allocation.awareness.attributes' => 'rack'
    }
  }
}
```

## Limitations

This module has been built on and tested against Puppet 3.2 and higher.

The module has been tested on:

* Debian 6/7/8
* CentOS 6/7
* OracleLinux 6/7
* Ubuntu 12.04, 14.04
* OpenSuSE 13.x
* SLES 12

Other distro's that have been reported to work:

* RHEL 6
* Scientific 6

Testing on other platforms has been light and cannot be guaranteed.

## Development

Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for instructions regarding development environments and testing.

## Support

Need help? Join us in [#elasticsearch](https://webchat.freenode.net?channels=%23elasticsearch) on Freenode IRC or on the [discussion forum](https://discuss.elastic.co/).
