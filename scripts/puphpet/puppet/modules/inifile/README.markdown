#inifile

[![Build Status](https://travis-ci.org/puppetlabs/puppetlabs-inifile.png?branch=master)](https://travis-ci.org/puppetlabs/puppetlabs-inifile)

####Table of Contents

1. [Overview](#overview)
2. [Module Description - What the module does and why it is useful](#module-description)
3. [Setup - The basics of getting started with inifile module](#setup)
    * [Beginning with inifile](#beginning-with-inifile)
4. [Usage - Configuration options and additional functionality](#usage)
5. [Reference - An under-the-hood peek at what the module is doing and how](#reference)
5. [Limitations - OS compatibility, etc.](#limitations)
6. [Development - Guide for contributing to the module](#development)

##Overview

The inifile module lets Puppet manage settings stored in INI-style configuration files.

##Module Description

Many applications use INI-style configuration files to store their settings. This module supplies two custom resource types to let you manage those settings through Puppet.

##Setup

###Beginning with inifile

To manage a single setting in an INI file, add the `ini_setting` type to a class:

~~~puppet
ini_setting { "sample setting":
  ensure  => present,
  path    => '/tmp/foo.ini',
  section => 'bar',
  setting => 'baz',
  value   => 'quux',
}
~~~

##Usage


The inifile module tries hard not to manipulate your file any more than it needs to. In most cases, it doesn't affect the original whitespace, comments, ordering, etc.

 * Supports comments starting with either '#' or ';'.
 * Supports either whitespace or no whitespace around '='.
 * Adds any missing sections to the INI file.

###Manage multiple values in a setting

Use the `ini_subsetting` type:

~~~puppet
ini_subsetting {'sample subsetting':
  ensure            => present,
  section           => '',
  key_val_separator => '=',
  path              => '/etc/default/pe-puppetdb',
  setting           => 'JAVA_ARGS',
  subsetting        => '-Xmx',
  value             => '512m',
}
~~~

Results in managing this `-Xmx` subsetting:

~~~puppet
JAVA_ARGS="-Xmx512m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/log/pe-puppetdb/puppetdb-oom.hprof"
~~~


###Use a non-standard section header

~~~puppet
ini_setting { 'default minage':
  ensure         => present,
  path           => '/etc/security/users',
  section        => 'default',
  setting        => 'minage',
  value          => '1',
  section_prefix => '',
  section_suffix => ':',
}
~~~

Results in:

~~~puppet
default:
   minage = 1
~~~

###Implement child providers

You might want to create child providers that inherit the `ini_setting` provider, for one or both of these purposes:

 * Make a custom resource to manage an application that stores its settings in INI files, without recreating the code to manage the files themselves.

 * [Purge all unmanaged settings](https://docs.puppetlabs.com/references/latest/type.html#resources-attribute-purge) from a managed INI file.

To implement child providers, first specify a custom type. Have it implement a namevar called `name` and a property called `value`:

~~~ruby
#my_module/lib/puppet/type/glance_api_config.rb
Puppet::Type.newtype(:glance_api_config) do
  ensurable
  newparam(:name, :namevar => true) do
    desc 'Section/setting name to manage from glance-api.conf'
    # namevar should be of the form section/setting
    newvalues(/\S+\/\S+/)
  end
  newproperty(:value) do
    desc 'The value of the setting to define'
    munge do |v|
      v.to_s.strip
    end
  end
end
~~~

Your type also needs a provider that uses the `ini_setting` provider as its parent:

~~~ruby
# my_module/lib/puppet/provider/glance_api_config/ini_setting.rb
Puppet::Type.type(:glance_api_config).provide(
  :ini_setting,
  # set ini_setting as the parent provider
  :parent => Puppet::Type.type(:ini_setting).provider(:ruby)
) do
  # implement section as the first part of the namevar
  def section
    resource[:name].split('/', 2).first
  end
  def setting
    # implement setting as the second part of the namevar
    resource[:name].split('/', 2).last
  end
  # hard code the file path (this allows purging)
  def self.file_path
    '/etc/glance/glance-api.conf'
  end
end
~~~

Now the settings in /etc/glance/glance-api.conf file can be managed as individual resources:

~~~puppet
glance_api_config { 'HEADER/important_config':
  value => 'secret_value',
}
~~~

If you've implemented self.file_path, you can have Puppet purge the file of all lines that aren't implemented as Puppet resources:

~~~puppet
resources { 'glance_api_config'
  purge => true,
}
~~~

### Manage multiple ini_settings

To manage multiple ini_settings, use the [`create_ini_settings`](#function-create_ini_settings) function.

~~~puppet
$defaults = { 'path' => '/tmp/foo.ini' }
$example = { 'section1' => { 'setting1' => 'value1' } }
create_ini_settings($example, $defaults)
~~~

results in:

~~~puppet
ini_setting { '[section1] setting1':
  ensure  => present,
  section => 'section1',
  setting => 'setting1',
  value   => 'value1',
  path    => '/tmp/foo.ini',
}
~~~

To include special parameters, the following code:

~~~puppet
$defaults = { 'path' => '/tmp/foo.ini' }
$example = {
  'section1' => {
    'setting1'  => 'value1',
    'settings2' => {
      'ensure' => 'absent'
    }
  }
}
create_ini_settings($example, $defaults)
~~~

results in:

~~~puppet
ini_setting { '[section1] setting1':
  ensure  => present,
  section => 'section1',
  setting => 'setting1',
  value   => 'value1',
  path    => '/tmp/foo.ini',
}
ini_setting { '[section1] setting2':
  ensure  => absent,
  section => 'section1',
  setting => 'setting2',
  path    => '/tmp/foo.ini',
}
~~~

#### Manage multiple ini_settings with Hiera

This example requires Puppet 3.x/4.x, as it uses automatic retrieval of Hiera data for class parameters and `puppetlabs/stdlib`.

For the profile `example`:

~~~puppet
class profile::example (
  $settings,
) {
  validate_hash($settings)
  $defaults = { 'path' => '/tmp/foo.ini' }
  create_ini_settings($settings, $defaults)
}
~~~

Provide this in your Hiera data:

~~~puppet
profile::example::settings:
  section1:
    setting1: value1
    setting2: value2
    setting3:
      ensure: absent
~~~

Results in:

~~~puppet
ini_setting { '[section1] setting1':
  ensure  => present,
  section => 'section1',
  setting => 'setting1',
  value   => 'value1',
  path    => '/tmp/foo.ini',
}
ini_setting { '[section1] setting2':
  ensure  => present,
  section => 'section1',
  setting => 'setting2',
  value   => 'value2',
  path    => '/tmp/foo.ini',
}
ini_setting { '[section1] setting3':
  ensure  => absent,
  section => 'section1',
  setting => 'setting3',
  path    => '/tmp/foo.ini',
}
~~~


##Reference

###Public Types

 * [`ini_setting`](#type-ini_setting)

 * [`ini_subsetting`](#type-ini_subsetting)

###Public Functions

 * [`create_ini_settings`](#function-create_ini_settings)

### Type: ini_setting

Manages a setting within an INI file.

#### Parameters

##### `ensure`

Determines whether the specified setting should exist. Valid options: 'present' and 'absent'. Default value: 'present'.

##### `key_val_separator`

*Optional.* Specifies a string to use between each setting name and value (e.g., to determine whether the separator includes whitespace). Valid options: a string. Default value: ' = '.

##### `name`

*Optional.* Specifies an arbitrary name to identify the resource. Valid options: a string. Default value: the title of your declared resource.

##### `path`

*Required.* Specifies an INI file containing the setting to manage. Valid options: a string containing an absolute path.

##### `section`

*Optional.* Designates a section of the specified INI file containing the setting to manage. To manage a global setting (at the beginning of the file, before any named sections) enter "". Defaults to "". Valid options: a string.

##### `setting`

*Required.* Designates a setting to manage within the specified INI file and section. Valid options: a string.

##### `show_diff`

*Optional.* Prevents outputting actual values to the logfile. Useful for handling of passwords and other sensitive information. Possible values are:
  * `true`: This allows all values to be passed to logfiles. (default)
  * `false`: The values in the logfiles will be replaced with `[redacted sensitive information]`. 
  * `md5`: The values in the logfiles will be replaced with their md5 hash.

Global show_diff configuraton takes priority over this one -
[https://docs.puppetlabs.com/references/latest/configuration.html#showdiff]([https://docs.puppetlabs.com/references/latest/configuration.html#showdiff].
). Default value: 'true'.

##### `value`

*Optional.* Supplies a value for the specified setting. Valid options: a string. Default value: undefined.

##### `section_prefix`

*Optional.*  Designates the string that will appear before the section's name.  Default value: "["

##### `section_suffix`

*Optional.*  Designates the string that will appear after the section's name.  Default value: "]".

##### `refreshonly`

*Optional.*  A boolean to indicate whether or not the value associated with the setting should be updated if this resource is only part of a refresh event.  Default value: **false**.

For example, if we want a timestamp associated with the last time a setting's value was updated, we could do something like this:

~~~
ini_setting { 'foosetting':
  ensure  => present,
  path    => '/tmp/file.ini',
  section => 'foo',
  setting => 'foosetting',
  value   => 'bar',
  notify  => Ini_Setting['foosetting_timestamp'],
}

$now = strftime('%Y-%m-%d %H:%M:%S')
ini_setting {'foosetting_timestamp':
  ensure      => present,
  path        => '/tmp/file.ini',
  section     => 'foo',
  setting     => 'foosetting_timestamp',
  value       => $now,
  refreshonly => true,
}
~~~

**NOTE:** This type finds all sections in the file by looking for lines like `${section_prefix}${title}${section_suffix}`.

### Type: ini_subsetting

Manages multiple values within the same INI setting.

#### Parameters

##### `ensure`

Specifies whether the subsetting should be present. Valid options: 'present' and 'absent'. Default value: 'present'.

##### `key_val_separator`

*Optional.* Specifies a string to use between setting name and value (e.g., to determine whether the separator includes whitespace). Valid options: a string. Default value: ' = '.

##### `path`

*Required.* Specifies an INI file containing the subsetting to manage. Valid options: a string containing an absolute path.

##### `quote_char`

*Optional.* The character used to quote the entire value of the setting. Valid values are '', '"', and "'". Defaults to ''. Valid options: '', '"' and "'". Default value: ''.

##### `section`

*Optional.* Designates a section of the specified INI file containing the setting to manage. To manage a global setting (at the beginning of the file, before any named sections) enter "". Defaults to "". Valid options: a string.

##### `setting`

*Required.* Designates a setting within the specified section containing the subsetting to manage. Valid options: a string.

##### `show_diff`

*Optional.* Prevents outputting actual values to the logfile. Useful for handling of passwords and other sensitive information. Possible values are:
  * `true`: This allows all values to be passed to logfiles. (default)
  * `false`: The values in the logfiles will be replaced with `[redacted sensitive information]`. 
  * `md5`: The values in the logfiles will be replaced with their md5 hash.

Global show_diff configuraton takes priority over this one -
[https://docs.puppetlabs.com/references/latest/configuration.html#showdiff]([https://docs.puppetlabs.com/references/latest/configuration.html#showdiff].
). Default value: 'true'.

##### `subsetting`

*Required.* Designates a subsetting to manage within the specified setting. Valid options: a string.

##### `subsetting_separator`

*Optional.* Specifies a string to use between subsettings. Valid options: a string. Default value: " ".

##### `subsetting_key_val_separator`

*Optional.* Specifies a string to use between subsetting name and value (if there is a separator between the subsetting name and its value). Valid options: a string. Default value: empty string.

##### `use_exact_match`

*Optional.* Whether to use partial or exact matching for subsetting. Should be set to true if the subsettings do not have values. Valid options: true, false. Default value: false.

##### `value`

*Optional.* Supplies a value for the specified subsetting. Valid options: a string. Default value: undefined.

##### `insert_type`

*Optional.* Selects where a new subsetting item should be inserted.

* *start*  - insert at the beginning of the line.
* *end*    - insert at the end of the line (default).
* *before* - insert before the specified element if possible.
* *after*  - insert after the specified element if possible.
* *index*  - insert at the specified index number.

##### `insert_value`

*Optional.* The value for the insert type if the value if required.

### Function: create_ini_settings

Manages multiple `ini_setting` resources from a hash. Note that this cannot be used with ini_subsettings.

`create_ini_settings($settings, $defaults)`

#### Arguments

##### First argument: `settings`

*Required.* Specify a hash representing the `ini_setting` resources you want to create.

##### Second argument: `defaults`

*Optional.* Accepts a hash to be used as the values for any attributes not defined in the first argument.

~~~puppet
$example = {
  'section1' => {
    'setting1' => {
      'value' => 'value1', 'path' => '/tmp/foo.ini'
    }
  }
}
~~~

Default value: '{}'.

##Limitations

This module has been tested on [all PE-supported platforms](https://forge.puppetlabs.com/supported#compat-matrix), and no issues have been identified. Additionally, it is tested (but not supported) on Windows 7, Mac OS X 10.9, and Solaris 12.

Due to (PUP-4709) the create_ini_settings function will cause errors when attempting to create multiple ini_settings in one go when using Puppet 4.0.x or 4.1.x. If needed, the temporary fix for this can be found here: https://github.com/puppetlabs/puppetlabs-inifile/pull/196.

##Development

Puppet Labs modules on the Puppet Forge are open projects, and community contributions are essential for keeping them great. We can't access the huge number of platforms and myriad of hardware, software, and deployment configurations that Puppet is intended to serve.

We want to keep it as easy as possible to contribute changes so that our modules work in your environment. There are a few guidelines that we need contributors to follow so that we can have a chance of keeping on top of things.

For more information, see our [module contribution guide.](https://docs.puppetlabs.com/forge/contributing.html)

###Contributors

To see who's already involved, see the [list of contributors.](https://github.com/puppetlabs/puppetlabs-inifile/graphs/contributors)
