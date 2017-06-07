#stdlib

####Table of Contents

1. [Overview](#overview)
2. [Module Description - What the module does and why it is useful](#module-description)
3. [Setup - The basics of getting started with stdlib](#setup)
4. [Usage - Configuration options and additional functionality](#usage)
5. [Reference - An under-the-hood peek at what the module is doing and how](#reference)
5. [Limitations - OS compatibility, etc.](#limitations)
6. [Development - Guide for contributing to the module](#development)

##Overview

Adds a standard library of resources for Puppet modules.

##Module Description

This module provides a standard library of resources for the development of Puppet modules. Puppet modules make heavy use of this standard library. The stdlib module adds the following resources to Puppet:

 * Stages
 * Facts
 * Functions
 * Defined resource types
 * Types
 * Providers

> *Note:* As of version 3.7, Puppet Enterprise no longer includes the stdlib module. If you're running Puppet Enterprise, you should install the most recent release of stdlib for compatibility with Puppet modules.

##Setup

Installing the stdlib module adds the functions, facts, and resources of this standard library to Puppet.

##Usage

After you've installed stdlib, all of its functions, facts, and resources are available for module use or development.

If you want to use a standardized set of run stages for Puppet, `include stdlib` in your manifest.

* `stdlib`: Most of stdlib's features are automatically loaded by Puppet. To use standardized run stages in Puppet, declare this class in your manifest with `include stdlib`.

  When declared, stdlib declares all other classes in the module. The only other class currently included in the module is `stdlib::stages`.

The `stdlib::stages` class declares various run stages for deploying infrastructure, language runtimes, and application layers. The high level stages are (in order):

  * setup
  * main
  * runtime
  * setup_infra
  * deploy_infra
  * setup_app
  * deploy_app
  * deploy

  Sample usage:

  ~~~
  node default {
    include stdlib
    class { java: stage => 'runtime' }
  }
  ~~~

## Reference

### Classes

#### Public Classes

  The stdlib class has no parameters.

#### Private Classes

* `stdlib::stages`: Manages a standard set of run stages for Puppet. It is managed by the stdlib class and should not be declared independently.

### Types

#### `file_line`

Ensures that a given line is contained within a file. The implementation matches the full line, including whitespace at the beginning and end. If the line is not contained in the given file, Puppet appends the line to the end of the file to ensure the desired state.  Multiple resources can be declared to manage multiple lines in the same file.

Example:

    file_line { 'sudo_rule':
      path => '/etc/sudoers',
      line => '%sudo ALL=(ALL) ALL',
    }

    file_line { 'sudo_rule_nopw':
      path => '/etc/sudoers',
      line => '%sudonopw ALL=(ALL) NOPASSWD: ALL',
    }

In this example, Puppet ensures that both of the specified lines are contained in the file `/etc/sudoers`.

Match Example:

    file_line { 'bashrc_proxy':
      ensure => present,
      path   => '/etc/bashrc',
      line   => 'export HTTP_PROXY=http://squid.puppetlabs.vm:3128',
      match  => '^export\ HTTP_PROXY\=',
    }

In this code example, `match` looks for a line beginning with export followed by HTTP_PROXY and replaces it with the value in line.

Match Example With `ensure => absent`:

    file_line { 'bashrc_proxy':
      ensure            => absent,
      path              => '/etc/bashrc',
      line              => 'export HTTP_PROXY=http://squid.puppetlabs.vm:3128',
      match             => '^export\ HTTP_PROXY\=',
      match_for_absence => true,
    }

In this code example, `match` looks for a line beginning with export
followed by HTTP_PROXY and delete it.  If multiple lines match, an
error will be raised unless the `multiple => true` parameter is set.

**Autorequires:** If Puppet is managing the file that contains the line being managed, the `file_line` resource autorequires that file.

##### Parameters

All parameters are optional, unless otherwise noted.

* `after`: Specifies the line after which Puppet adds any new lines. (Existing lines are added in place.) Valid options: String. Default: Undefined.
* `ensure`: Ensures whether the resource is present. Valid options: 'present', 'absent'. Default: 'present'.
* `line`: **Required.** Sets the line to be added to the file located by the `path` parameter. Valid options: String. Default: Undefined.
* `match`: Specifies a regular expression to run against existing lines in the file; if a match is found, it is replaced rather than adding a new line. A regex comparison is performed against the line value, and if it does not match, an exception is raised. Valid options: String containing a regex. Default: Undefined.
* `match_for_absence`: An optional value to determine if match should be applied when `ensure => absent`. If set to true and match is set, the line that matches match will be deleted. If set to false (the default), match is ignored when `ensure => absent` and the value of `line` is used instead. Default: false.
* `multiple`: Determines if `match` and/or `after` can change multiple lines. If set to false, an exception will be raised if more than one line matches. Valid options: 'true', 'false'. Default: Undefined.
* `name`: Sets the name to use as the identity of the resource. This is necessary if you want the resource namevar to differ from the supplied `title` of the resource. Valid options: String. Default: Undefined.
* `path`: **Required.** Defines the file in which Puppet will ensure the line specified by `line`. Must be an absolute path to the file.
* `replace`: Defines whether the resource will overwrite an existing line that matches the `match` parameter. If set to false and a line is found matching the `match` param, the line will not be placed in the file. Valid options: true, false, yes, no. Default: true

### Functions

#### `abs`

Returns the absolute value of a number; for example, '-34.56' becomes '34.56'. Takes a single integer and float value as an argument. *Type*: rvalue.

#### `any2array`

Converts any object to an array containing that object. Empty argument lists are converted to an empty array. Arrays are left untouched. Hashes are converted to arrays of alternating keys and values. *Type*: rvalue.

#### `base64`

Converts a string to and from base64 encoding. Requires an `action` ('encode', 'decode') and either a plain or base64-encoded `string`, and an optional `method` ('default', 'strict', 'urlsafe')

For backward compatibility, `method` will be set as `default` if not specified.

*Examples:*
~~~
base64('encode', 'hello')
base64('encode', 'hello', 'default')
# return: "aGVsbG8=\n"

base64('encode', 'hello', 'strict')
# return: "aGVsbG8="

base64('decode', 'aGVsbG8=')
base64('decode', 'aGVsbG8=\n')
base64('decode', 'aGVsbG8=', 'default')
base64('decode', 'aGVsbG8=\n', 'default')
base64('decode', 'aGVsbG8=', 'strict')
# return: "hello"

base64('encode', 'https://puppetlabs.com', 'urlsafe')
# return: "aHR0cHM6Ly9wdXBwZXRsYWJzLmNvbQ=="

base64('decode', 'aHR0cHM6Ly9wdXBwZXRsYWJzLmNvbQ==', 'urlsafe')
# return: "https://puppetlabs.com"
~~~

*Type*: rvalue.

#### `basename`

Returns the `basename` of a path (optionally stripping an extension). For example:
  * ('/path/to/a/file.ext') returns 'file.ext'
  * ('relative/path/file.ext') returns 'file.ext'
  * ('/path/to/a/file.ext', '.ext') returns 'file'

*Type*: rvalue.

#### `bool2num`

Converts a boolean to a number. Converts values:
  * 'false', 'f', '0', 'n', and 'no' to 0.
  * 'true', 't', '1', 'y', and 'yes' to 1.
  Requires a single boolean or string as an input. *Type*: rvalue.

#### `bool2str`

Converts a boolean to a string using optionally supplied arguments. The optional second and third arguments represent what true and false are converted to respectively. If only one argument is given, it is converted from a boolean to a string containing 'true' or 'false'.

*Examples:*
~~~
bool2str(true)                    => 'true'
bool2str(true, 'yes', 'no')       => 'yes'
bool2str(false, 't', 'f')         => 'f'
~~~

Requires a single boolean as input. *Type*: rvalue.

#### `capitalize`

Capitalizes the first character of a string or array of strings and lowercases the remaining characters of each string. Requires either a single string or an array as an input. *Type*: rvalue.

#### `ceiling`

Returns the smallest integer greater than or equal to the argument. Takes a single numeric value as an argument. *Type*: rvalue.

#### `chomp`

Removes the record separator from the end of a string or an array of strings; for example, 'hello\n' becomes 'hello'. Requires a single string or array as an input. *Type*: rvalue.

#### `chop`

Returns a new string with the last character removed. If the string ends with '\r\n', both characters are removed. Applying `chop` to an empty string returns an empty string. If you want to merely remove record separators, then you should use the `chomp` function. Requires a string or an array of strings as input. *Type*: rvalue.

#### `clamp`

Keeps value within the range [Min, X, Max] by sort based on integer value (order of params doesn't matter). Takes strings, arrays or numerics. Strings are converted and compared numerically. Arrays of values are flattened into a list for further handling. For example:
  * `clamp('24', [575, 187])` returns 187.
  * `clamp(16, 88, 661)` returns 88.
  * `clamp([4, 3, '99'])` returns 4.
  *Type*: rvalue.

#### `concat`

Appends the contents of multiple arrays onto the first array given. For example:
  * `concat(['1','2','3'],'4')` returns ['1','2','3','4'].
  * `concat(['1','2','3'],'4',['5','6','7'])` returns ['1','2','3','4','5','6','7'].
  *Type*: rvalue.

#### `convert_base`

Converts a given integer or base 10 string representing an integer to a specified base, as a string. For example:
  * `convert_base(5, 2)` results in: '101'
  * `convert_base('254', '16')` results in: 'fe'

#### `count`

If called with only an array, it counts the number of elements that are **not** nil/undef. If called with a second argument, counts the number of elements in an array that matches the second argument. *Type*: rvalue.

#### `defined_with_params`

Takes a resource reference and an optional hash of attributes. Returns 'true' if a resource with the specified attributes has already been added to the catalog. Returns 'false' otherwise.

  ~~~
  user { 'dan':
    ensure => present,
  }

  if ! defined_with_params(User[dan], {'ensure' => 'present' }) {
    user { 'dan': ensure => present, }
  }
  ~~~

*Type*: rvalue.

#### `delete`

Deletes all instances of a given element from an array, substring from a string, or key from a hash. For example, `delete(['a','b','c','b'], 'b')` returns ['a','c']; `delete('abracadabra', 'bra')` returns 'acada'. `delete({'a' => 1,'b' => 2,'c' => 3},['b','c'])` returns {'a'=> 1}. *Type*: rvalue.

#### `delete_at`

Deletes a determined indexed value from an array. For example, `delete_at(['a','b','c'], 1)` returns ['a','c']. *Type*: rvalue.

#### `delete_values`

Deletes all instances of a given value from a hash. For example, `delete_values({'a'=>'A','b'=>'B','c'=>'C','B'=>'D'}, 'B')` returns {'a'=>'A','c'=>'C','B'=>'D'} *Type*: rvalue.

#### `delete_undef_values`

Deletes all instances of the undef value from an array or hash. For example, `$hash = delete_undef_values({a=>'A', b=>'', c=>undef, d => false})` returns {a => 'A', b => '', d => false}. *Type*: rvalue.

#### `difference`

Returns the difference between two arrays. The returned array is a copy of the original array, removing any items that also appear in the second array. For example, `difference(["a","b","c"],["b","c","d"])` returns ["a"]. *Type*: rvalue.

#### `dig`

*Type*: rvalue.

Retrieves a value within multiple layers of hashes and arrays via an array of keys containing a path. The function goes through the structure by each path component and tries to return the value at the end of the path.

In addition to the required path argument, the function accepts the default argument. It is returned if the path is not correct, if no value was found, or if any other error has occurred.

~~~ruby
$data = {
  'a' => {
    'b' => [
      'b1',
      'b2',
      'b3',
    ]
  }
}

$value = dig($data, ['a', 'b', 2])
# $value = 'b3'

# with all possible options
$value = dig($data, ['a', 'b', 2], 'not_found')
# $value = 'b3'

# using the default value
$value = dig($data, ['a', 'b', 'c', 'd'], 'not_found')
# $value = 'not_found'
~~~

1. **$data** The data structure we are working with.
2. **['a', 'b', 2]** The path array.
3. **'not_found'** The default value. It will be returned if nothing is found.
   (optional, defaults to *undef*)

#### `dirname`

Returns the `dirname` of a path. For example, `dirname('/path/to/a/file.ext')` returns '/path/to/a'. *Type*: rvalue.

#### `dos2unix`

Returns the Unix version of the given string. Very useful when using a File resource with a cross-platform template. *Type*: rvalue.

~~~
file{$config_file:
  ensure  => file,
  content => dos2unix(template('my_module/settings.conf.erb')),
}
~~~

See also [unix2dos](#unix2dos).

#### `downcase`

Converts the case of a string or of all strings in an array to lowercase. *Type*: rvalue.

#### `empty`

Returns true if the argument is an array or hash that contains no elements, or an empty string. Returns false when the argument is a numerical value. *Type*: rvalue.

#### `enclose_ipv6`

Takes an array of ip addresses and encloses the ipv6 addresses with square brackets. *Type*: rvalue.

#### `ensure_packages`

Takes a list of packages array/hash and only installs them if they don't already exist. It optionally takes a hash as a second parameter to be passed as the third argument to the `ensure_resource()` or `ensure_resources()` function. *Type*: statement.

For Array:

    ensure_packages(['ksh','openssl'], {'ensure' => 'present'})

For Hash:

    ensure_packages({'ksh' => { enure => '20120801-1' } ,  'mypackage' => { source => '/tmp/myrpm-1.0.0.x86_64.rpm', provider => "rpm" }}, {'ensure' => 'present'})

#### `ensure_resource`

Takes a resource type, title, and a hash of attributes that describe the resource(s).

~~~
user { 'dan':
  ensure => present,
}
~~~

This example only creates the resource if it does not already exist:

  `ensure_resource('user', 'dan', {'ensure' => 'present' })`

If the resource already exists, but does not match the specified parameters, this function attempts to recreate the resource, leading to a duplicate resource definition error.

An array of resources can also be passed in, and each will be created with the type and parameters specified if it doesn't already exist.

  `ensure_resource('user', ['dan','alex'], {'ensure' => 'present'})`

*Type*: statement.

#### `ensure_resources`

Takes a resource type, title (only hash), and a hash of attributes that describe the resource(s).

~~~
user { 'dan':
  gid => 'mygroup',
  ensure => present,
}

ensure_resources($user)
~~~

An hash of resources should be passed in and each will be created with the type and parameters specified if it doesn't already exist:

    ensure_resources('user', {'dan' => { gid => 'mygroup', uid => '600' } ,  'alex' => { gid => 'mygroup' }}, {'ensure' => 'present'})

From Hiera Backend:

~~~
userlist:
dan:
  gid: 'mygroup'
uid: '600'
alex:
gid: 'mygroup'

ensure_resources('user', hiera_hash('userlist'), {'ensure' => 'present'})
~~~

### `flatten`

Flattens deeply nested arrays and returns a single flat array as a result. For example, `flatten(['a', ['b', ['c']]])` returns ['a','b','c']. *Type*: rvalue.

#### `floor`

Takes a single numeric value as an argument, and returns the largest integer less than or equal to the argument. *Type*: rvalue.

#### `fqdn_rand_string`

Generates a random alphanumeric string using an optionally-specified character set (default is alphanumeric), combining the `$fqdn` fact and an optional seed for repeatable randomness.

*Usage:*
~~~
fqdn_rand_string(LENGTH, [CHARSET], [SEED])
~~~
*Examples:*
~~~
fqdn_rand_string(10)
fqdn_rand_string(10, 'ABCDEF!@#$%^')
fqdn_rand_string(10, '', 'custom seed')
~~~

*Type*: rvalue.

#### `fqdn_rotate`

Rotates an array or string a random number of times, combining the `$fqdn` fact and an optional seed for repeatable randomness.

*Usage:*

~~~
fqdn_rotate(VALUE, [SEED])
~~~

*Examples:*

~~~
fqdn_rotate(['a', 'b', 'c', 'd'])
fqdn_rotate('abcd')
fqdn_rotate([1, 2, 3], 'custom seed')
~~~

*Type*: rvalue.

#### `get_module_path`

Returns the absolute path of the specified module for the current environment.

  `$module_path = get_module_path('stdlib')`

*Type*: rvalue.

#### `getparam`

Takes a resource reference and the name of the parameter, and returns the value of the resource's parameter.

For example, the following returns 'param_value':

  ~~~
  define example_resource($param) {
  }

  example_resource { "example_resource_instance":
    param => "param_value"
  }

  getparam(Example_resource["example_resource_instance"], "param")
  ~~~

*Type*: rvalue.

#### `getvar`

Looks up a variable in a remote namespace.

For example:

  ~~~
  $foo = getvar('site::data::foo')
  # Equivalent to $foo = $site::data::foo
  ~~~

This is useful if the namespace itself is stored in a string:

  ~~~
  $datalocation = 'site::data'
  $bar = getvar("${datalocation}::bar")
  # Equivalent to $bar = $site::data::bar
  ~~~

*Type*: rvalue.

#### `grep`

Searches through an array and returns any elements that match the provided regular expression. For example, `grep(['aaa','bbb','ccc','aaaddd'], 'aaa')` returns ['aaa','aaaddd']. *Type*: rvalue.

#### `has_interface_with`

Returns a boolean based on kind and value:
  * macaddress
  * netmask
  * ipaddress
  * network

*Examples:*

  ~~~
  has_interface_with("macaddress", "x:x:x:x:x:x")
  has_interface_with("ipaddress", "127.0.0.1")    => true
  ~~~

If no kind is given, then the presence of the interface is checked:

  ~~~
  has_interface_with("lo")                        => true
  ~~~

*Type*: rvalue.

#### `has_ip_address`

Returns 'true' if the client has the requested IP address on some interface. This function iterates through the `interfaces` fact and checks the `ipaddress_IFACE` facts, performing a simple string comparison. *Type*: rvalue.

#### `has_ip_network`

Returns 'true' if the client has an IP address within the requested network. This function iterates through the `interfaces` fact and checks the `network_IFACE` facts, performing a simple string comparision. *Type*: rvalue.

#### `has_key`

Determines if a hash has a certain key value.

*Example*:

  ~~~
  $my_hash = {'key_one' => 'value_one'}
  if has_key($my_hash, 'key_two') {
    notice('we will not reach here')
  }
  if has_key($my_hash, 'key_one') {
    notice('this will be printed')
  }
  ~~~

*Type*: rvalue.

#### `hash`

Converts an array into a hash. For example, `hash(['a',1,'b',2,'c',3])` returns {'a'=>1,'b'=>2,'c'=>3}. *Type*: rvalue.

#### `intersection`

Returns an array an intersection of two. For example, `intersection(["a","b","c"],["b","c","d"])` returns ["b","c"]. *Type*: rvalue.

#### `is_a`

Boolean check to determine whether a variable is of a given data type. This is equivalent to the `=~` type checks. This function is available only in Puppet 4 or in Puppet 3 with the "future" parser.

  ~~~
  foo = 3
  $bar = [1,2,3]
  $baz = 'A string!'

  if $foo.is_a(Integer) {
    notify  { 'foo!': }
  }
  if $bar.is_a(Array) {
    notify { 'bar!': }
  }
  if $baz.is_a(String) {
    notify { 'baz!': }
  }
  ~~~

See the [the Puppet type system](https://docs.puppetlabs.com/references/latest/type.html#about-resource-types) for more information about types.
See the [`assert_type()`](https://docs.puppetlabs.com/references/latest/function.html#asserttype) function for flexible ways to assert the type of a value.

#### `is_absolute_path`

Returns 'true' if the given path is absolute. *Type*: rvalue.

#### `is_array`

Returns 'true' if the variable passed to this function is an array. *Type*: rvalue.

#### `is_bool`

Returns 'true' if the variable passed to this function is a boolean. *Type*: rvalue.

#### `is_domain_name`

Returns 'true' if the string passed to this function is a syntactically correct domain name. *Type*: rvalue.

#### `is_float`

Returns 'true' if the variable passed to this function is a float. *Type*: rvalue.

#### `is_function_available`

Accepts a string as an argument and determines whether the Puppet runtime has access to a function by that name. It returns 'true' if the function exists, 'false' if not. *Type*: rvalue.

#### `is_hash`

Returns 'true' if the variable passed to this function is a hash. *Type*: rvalue.

#### `is_integer`

Returns 'true' if the variable returned to this string is an integer. *Type*: rvalue.

#### `is_ip_address`

Returns 'true' if the string passed to this function is a valid IP address. *Type*: rvalue.

#### `is_ipv6_address`

Returns 'true' if the string passed to this function is a valid IPv6 address. *Type*: rvalue.

#### `is_ipv4_address`

Returns 'true' if the string passed to this function is a valid IPv4 address. *Type*: rvalue.

#### `is_mac_address`

Returns 'true' if the string passed to this function is a valid MAC address. *Type*: rvalue.

#### `is_numeric`

Returns 'true' if the variable passed to this function is a number. *Type*: rvalue.

#### `is_string`

Returns 'true' if the variable passed to this function is a string. *Type*: rvalue.

#### `join`

Joins an array into a string using a separator. For example, `join(['a','b','c'], ",")` results in: "a,b,c". *Type*: rvalue.

#### `join_keys_to_values`

Joins each key of a hash to that key's corresponding value with a separator. Keys and values are cast to strings. The return value is an array in which each element is one joined key/value pair. For example, `join_keys_to_values({'a'=>1,'b'=>2}, " is ")` results in ["a is 1","b is 2"]. *Type*: rvalue.

#### `keys`

Returns the keys of a hash as an array. *Type*: rvalue.

#### `loadyaml`

Loads a YAML file containing an array, string, or hash, and returns the data in the corresponding native data type. For example:

  ~~~
  $myhash = loadyaml('/etc/puppet/data/myhash.yaml')
  ~~~

*Type*: rvalue.

#### `load_module_metadata`

Loads the metadata.json of a target module. Can be used to determine module version and authorship for dynamic support of modules.

  ~~~
  $metadata = load_module_metadata('archive')
  notify { $metadata['author']: }
  ~~~

If you do not want to fail the catalog compilation when a module's metadata file is absent:

  ~~~
  $metadata = load_module_metadata('mysql', true)
  if empty($metadata) {
    notify { "This module does not have a metadata.json file.": }
  }
  ~~~

*Type*: rvalue.

#### `lstrip`

Strips spaces to the left of a string. *Type*: rvalue.

#### `max`

Returns the highest value of all arguments. Requires at least one argument. *Type*: rvalue.

#### `member`

This function determines if a variable is a member of an array. The variable can be either a string, array, or fixnum. For example, `member(['a','b'], 'b')` and `member(['a','b','c'], ['b','c'])` return 'true', while `member(['a','b'], 'c')` and `member(['a','b','c'], ['c','d'])` return 'false'. *Note*: This function does not support nested arrays. If the first argument contains nested arrays, it will not recurse through them.

*Type*: rvalue.

#### `merge`

Merges two or more hashes together and returns the resulting hash.

*Example*:

  ~~~
  $hash1 = {'one' => 1, 'two' => 2}
  $hash2 = {'two' => 'dos', 'three' => 'tres'}
  $merged_hash = merge($hash1, $hash2)
  # The resulting hash is equivalent to:
  # $merged_hash =  {'one' => 1, 'two' => 'dos', 'three' => 'tres'}
  ~~~

When there is a duplicate key, the key in the rightmost hash "wins." *Type*: rvalue.

#### `min`

Returns the lowest value of all arguments. Requires at least one argument. *Type*: rvalue.

#### `num2bool`

Converts a number or a string representation of a number into a true boolean. Zero or anything non-numeric becomes 'false'. Numbers greater than 0 become 'true'. *Type*: rvalue.

#### `parsejson`

Converts a string of JSON into the correct Puppet structure. *Type*: rvalue. The optional second argument is returned if the data was not correct.

#### `parseyaml`

Converts a string of YAML into the correct Puppet structure. *Type*: rvalue. The optional second argument is returned if the data was not correct.

#### `pick`

From a list of values, returns the first value that is not undefined or an empty string. Takes any number of arguments, and raises an error if all values are undefined or empty.

  ~~~
  $real_jenkins_version = pick($::jenkins_version, '1.449')
  ~~~

*Type*: rvalue.

#### `pick_default`

Returns the first value in a list of values. Contrary to the `pick()` function, the `pick_default()` does not fail if all arguments are empty. This allows it to use an empty value as default. *Type*: rvalue.

#### `prefix`

Applies a prefix to all elements in an array, or to the keys in a hash.
For example:
* `prefix(['a','b','c'], 'p')` returns ['pa','pb','pc']
* `prefix({'a'=>'b','b'=>'c','c'=>'d'}, 'p')` returns {'pa'=>'b','pb'=>'c','pc'=>'d'}.

*Type*: rvalue.

#### `assert_private`

Sets the current class or definition as private. Calling the class or definition from outside the current module will fail.

For example, `assert_private()` called in class `foo::bar` outputs the following message if class is called from outside module `foo`:

  ~~~
  Class foo::bar is private
  ~~~

  To specify the error message you want to use:

  ~~~
  assert_private("You're not supposed to do that!")
  ~~~

*Type*: statement.

#### `pw_hash`

Hashes a password using the crypt function. Provides a hash usable on most POSIX systems.

The first argument to this function is the password to hash. If it is undef or an empty string, this function returns undef.

The second argument to this function is which type of hash to use. It will be converted into the appropriate crypt(3) hash specifier. Valid hash types are:

|Hash type            |Specifier|
|---------------------|---------|
|MD5                  |1        |
|SHA-256              |5        |
|SHA-512 (recommended)|6        |

The third argument to this function is the salt to use.

*Type*: rvalue.

**Note:** this uses the Puppet master's implementation of crypt(3). If your environment contains several different operating systems, ensure that they are compatible before using this function.

#### `range`

Extrapolates a range as an array when given in the form of '(start, stop)'. For example, `range("0", "9")` returns [0,1,2,3,4,5,6,7,8,9]. Zero-padded strings are converted to integers automatically, so `range("00", "09")` returns [0,1,2,3,4,5,6,7,8,9].

Non-integer strings are accepted; `range("a", "c")` returns ["a","b","c"], and `range("host01", "host10")` returns ["host01", "host02", ..., "host09", "host10"].

Passing a third argument will cause the generated range to step by that interval, e.g. `range("0", "9", "2")` returns ["0","2","4","6","8"].

*Type*: rvalue.

#### `reject`

Searches through an array and rejects all elements that match the provided regular expression. For example, `reject(['aaa','bbb','ccc','aaaddd'], 'aaa')` returns ['bbb','ccc']. *Type*: rvalue.

#### `reverse`

Reverses the order of a string or array. *Type*: rvalue.

#### `rstrip`

Strips spaces to the right of the string. *Type*: rvalue.

#### `seeded_rand`

Takes an integer max value and a string seed value and returns a repeatable random integer smaller than max. Like `fqdn_rand`, but does not add node specific data to the seed.  *Type*: rvalue.

#### `shuffle`

Randomizes the order of a string or array elements. *Type*: rvalue.

#### `size`

Returns the number of elements in a string, an array or a hash. *Type*: rvalue.

#### `sort`

Sorts strings and arrays lexically. *Type*: rvalue.

#### `squeeze`

Returns a new string where runs of the same character that occur in this set are replaced by a single character. *Type*: rvalue.

#### `str2bool`

Converts certain strings to a boolean. This attempts to convert strings that contain the values '1', 't', 'y', or 'yes' to true. Strings that contain values '0', 'f', 'n', or 'no', or that are an empty string or undefined are converted to false. Any other value causes an error. *Type*: rvalue.

#### `str2saltedsha512`

Converts a string to a salted-SHA512 password hash, used for OS X versions >= 10.7. Given any string, this function returns a hex version of a salted-SHA512 password hash, which can be inserted into your Puppet
manifests as a valid password attribute. *Type*: rvalue.

#### `strftime`

Returns formatted time. For example, `strftime("%s")` returns the time since Unix epoch, and `strftime("%Y-%m-%d")` returns the date. *Type*: rvalue.

  *Format:*

    * `%a`: The abbreviated weekday name ('Sun')
    * `%A`: The full weekday name ('Sunday')
    * `%b`: The abbreviated month name ('Jan')
    * `%B`: The full month name ('January')
    * `%c`: The preferred local date and time representation
    * `%C`: Century (20 in 2009)
    * `%d`: Day of the month (01..31)
    * `%D`: Date (%m/%d/%y)
    * `%e`: Day of the month, blank-padded ( 1..31)
    * `%F`: Equivalent to %Y-%m-%d (the ISO 8601 date format)
    * `%h`: Equivalent to %b
    * `%H`: Hour of the day, 24-hour clock (00..23)
    * `%I`: Hour of the day, 12-hour clock (01..12)
    * `%j`: Day of the year (001..366)
    * `%k`: Hour, 24-hour clock, blank-padded ( 0..23)
    * `%l`: Hour, 12-hour clock, blank-padded ( 0..12)
    * `%L`: Millisecond of the second (000..999)
    * `%m`: Month of the year (01..12)
    * `%M`: Minute of the hour (00..59)
    * `%n`: Newline (\n)
    * `%N`: Fractional seconds digits, default is 9 digits (nanosecond)
      * `%3N`: Millisecond (3 digits)
      * `%6N`: Microsecond (6 digits)
      * `%9N`: Nanosecond (9 digits)
    * `%p`: Meridian indicator ('AM' or 'PM')
    * `%P`: Meridian indicator ('am' or 'pm')
    * `%r`: Time, 12-hour (same as %I:%M:%S %p)
    * `%R`: Time, 24-hour (%H:%M)
    * `%s`: Number of seconds since the Unix epoch, 1970-01-01 00:00:00 UTC.
    * `%S`: Second of the minute (00..60)
    * `%t`: Tab character (	)
    * `%T`: Time, 24-hour (%H:%M:%S)
    * `%u`: Day of the week as a decimal, Monday being 1. (1..7)
    * `%U`: Week number of the current year, starting with the first Sunday as the first day of the first week (00..53)
    * `%v`: VMS date (%e-%b-%Y)
    * `%V`: Week number of year according to ISO 8601 (01..53)
    * `%W`: Week number of the current year, starting with the first Monday as the first day of the first week (00..53)
    * `%w`: Day of the week (Sunday is 0, 0..6)
    * `%x`: Preferred representation for the date alone, no time
    * `%X`: Preferred representation for the time alone, no date
    * `%y`: Year without a century (00..99)
    * `%Y`: Year with century
    * `%z`: Time zone as hour offset from UTC (e.g. +0900)
    * `%Z`: Time zone name
    * `%%`: Literal '%' character

#### `strip`

Removes leading and trailing whitespace from a string or from every string inside an array. For example, `strip("    aaa   ")` results in "aaa". *Type*: rvalue.

#### `suffix`

Applies a suffix to all elements in an array, or to the keys in a hash.
For example:
* `suffix(['a','b','c'], 'p')` returns ['ap','bp','cp']
* `suffix({'a'=>'b','b'=>'c','c'=>'d'}, 'p')` returns {'ap'=>'b','bp'=>'c','cp'=>'d'}.

*Type*: rvalue.

#### `swapcase`

Swaps the existing case of a string. For example, `swapcase("aBcD")` results in "AbCd". *Type*: rvalue.

#### `time`

Returns the current Unix epoch time as an integer. For example, `time()` returns something like '1311972653'. *Type*: rvalue.

#### `to_bytes`

Converts the argument into bytes, for example "4 kB" becomes "4096". Takes a single string value as an argument. *Type*: rvalue.

#### `try_get_value`

*Type*: rvalue.

DEPRECATED: replaced by `dig()`.

Retrieves a value within multiple layers of hashes and arrays via a string containing a path. The path is a string of hash keys or array indexes starting with zero, separated by the path separator character (default "/"). The function goes through the structure by each path component and tries to return the value at the end of the path.

In addition to the required path argument, the function accepts the default argument. It is returned if the path is not correct, if no value was found, or if any other error has occurred. The last argument can set the path separator character.

~~~ruby
$data = {
  'a' => {
    'b' => [
      'b1',
      'b2',
      'b3',
    ]
  }
}

$value = try_get_value($data, 'a/b/2')
# $value = 'b3'

# with all possible options
$value = try_get_value($data, 'a/b/2', 'not_found', '/')
# $value = 'b3'

# using the default value
$value = try_get_value($data, 'a/b/c/d', 'not_found')
# $value = 'not_found'

# using custom separator
$value = try_get_value($data, 'a|b', [], '|')
# $value = ['b1','b2','b3']
~~~

1. **$data** The data structure we are working with.
2. **'a/b/2'** The path string.
3. **'not_found'** The default value. It will be returned if nothing is found.
   (optional, defaults to *undef*)
4. **'/'** The path separator character.
   (optional, defaults to *'/'*)

#### `type3x`

Returns a string description of the type when passed a value. Type can be a string, array, hash, float, integer, or boolean. This function will be removed when Puppet 3 support is dropped and the new type system can be used. *Type*: rvalue.

#### `type_of`

Returns the literal type when passed a value. Requires the new parser. Useful for comparison of types with `<=` such as in `if type_of($some_value) <= Array[String] { ... }` (which is equivalent to `if $some_value =~ Array[String] { ... }`) *Type*: rvalue.

#### `union`

Returns a union of two or more arrays, without duplicates. For example, `union(["a","b","c"],["b","c","d"])` returns ["a","b","c","d"]. *Type*: rvalue.

#### `unique`

Removes duplicates from strings and arrays. For example, `unique("aabbcc")` returns 'abc', and `unique(["a","a","b","b","c","c"])` returns ["a","b","c"]. *Type*: rvalue.

#### `unix2dos`

Returns the DOS version of the given string. Very useful when using a File resource with a cross-platform template. *Type*: rvalue.

~~~
file{$config_file:
  ensure  => file,
  content => unix2dos(template('my_module/settings.conf.erb')),
}
~~~

See also [dos2unix](#dos2unix).

#### `upcase`

Converts an object, array or hash of objects that respond to upcase to uppercase. For example, `upcase('abcd')` returns 'ABCD'. *Type*: rvalue.

#### `uriescape`

URLEncodes a string or array of strings. Requires either a single string or an array as an input. *Type*: rvalue.

#### `validate_absolute_path`

Validates that a given string represents an absolute path in the filesystem. Works for Windows and Unix style paths.

The following values pass:

~~~
$my_path = 'C:/Program Files (x86)/Puppet Labs/Puppet'
validate_absolute_path($my_path)
$my_path2 = '/var/lib/puppet'
validate_absolute_path($my_path2)
$my_path3 = ['C:/Program Files (x86)/Puppet Labs/Puppet','C:/Program Files/Puppet Labs/Puppet']
validate_absolute_path($my_path3)
$my_path4 = ['/var/lib/puppet','/usr/share/puppet']
validate_absolute_path($my_path4)
~~~

The following values fail, causing compilation to abort:

~~~
validate_absolute_path(true)
validate_absolute_path('../var/lib/puppet')
validate_absolute_path('var/lib/puppet')
validate_absolute_path([ 'var/lib/puppet', '/var/foo' ])
validate_absolute_path([ '/var/lib/puppet', 'var/foo' ])
$undefined = undef
validate_absolute_path($undefined)
~~~

*Type*: statement.

#### `validate_array`

Validates that all passed values are array data structures. Aborts catalog compilation if any value fails this check.

The following values pass:

~~~
$my_array = [ 'one', 'two' ]
validate_array($my_array)
~~~

The following values fail, causing compilation to abort:

~~~
validate_array(true)
validate_array('some_string')
$undefined = undef
validate_array($undefined)
~~~

*Type*: statement.

#### `validate_augeas`

Performs validation of a string using an Augeas lens. The first argument of this function should be the string to test, and the second argument should be the name of the Augeas lens to use. If Augeas fails to parse the string with the lens, the compilation aborts with a parse error.

A third optional argument lists paths which should **not** be found in the file. The `$file` variable points to the location of the temporary file being tested in the Augeas tree.

For example, to make sure your $passwdcontent never contains user `foo`:

~~~
validate_augeas($passwdcontent, 'Passwd.lns', ['$file/foo'])
~~~

To ensure that no users use the '/bin/barsh' shell:

~~~
validate_augeas($passwdcontent, 'Passwd.lns', ['$file/*[shell="/bin/barsh"]']
~~~

You can pass a fourth argument as the error message raised and shown to the user:

~~~
validate_augeas($sudoerscontent, 'Sudoers.lns', [], 'Failed to validate sudoers content with Augeas')
~~~

*Type*: statement.

#### `validate_bool`

Validates that all passed values are either true or false. Aborts catalog compilation if any value fails this check.

The following values will pass:

~~~
$iamtrue = true
validate_bool(true)
validate_bool(true, true, false, $iamtrue)
~~~

The following values will fail, causing compilation to abort:

~~~
$some_array = [ true ]
validate_bool("false")
validate_bool("true")
validate_bool($some_array)
~~~

*Type*: statement.

#### `validate_cmd`

Performs validation of a string with an external command. The first argument of this function should be a string to test, and the second argument should be a path to a test command taking a % as a placeholder for the file path (will default to the end of the command if no % placeholder given). If the command is launched against a tempfile containing the passed string, or returns a non-null value, compilation will abort with a parse error.

If a third argument is specified, this will be the error message raised and seen by the user.

~~~
# Defaults to end of path
validate_cmd($sudoerscontent, '/usr/sbin/visudo -c -f', 'Visudo failed to validate sudoers content')
~~~
~~~
# % as file location
validate_cmd($haproxycontent, '/usr/sbin/haproxy -f % -c', 'Haproxy failed to validate config content')
~~~

*Type*: statement.

#### `validate_hash`

Validates that all passed values are hash data structures. Aborts catalog compilation if any value fails this check.

  The following values will pass:

  ~~~
  $my_hash = { 'one' => 'two' }
  validate_hash($my_hash)
  ~~~

  The following values will fail, causing compilation to abort:

  ~~~
  validate_hash(true)
  validate_hash('some_string')
  $undefined = undef
  validate_hash($undefined)
  ~~~

*Type*: statement.

#### `validate_integer`

Validates that the first argument is an integer (or an array of integers). Aborts catalog compilation if any of the checks fail.

  The second argument is optional and passes a maximum. (All elements of) the first argument has to be less or equal to this max.

  The third argument is optional and passes a minimum. (All elements of) the first argument has to be greater or equal to this min.
  If, and only if, a minimum is given, the second argument may be an empty string or undef, which will be handled to just check
  if (all elements of) the first argument are greater or equal to the given minimum.

  It will fail if the first argument is not an integer or array of integers, and if arg 2 and arg 3 are not convertable to an integer.

  The following values will pass:

  ~~~
  validate_integer(1)
  validate_integer(1, 2)
  validate_integer(1, 1)
  validate_integer(1, 2, 0)
  validate_integer(2, 2, 2)
  validate_integer(2, '', 0)
  validate_integer(2, undef, 0)
  $foo = undef
  validate_integer(2, $foo, 0)
  validate_integer([1,2,3,4,5], 6)
  validate_integer([1,2,3,4,5], 6, 0)
  ~~~

  * Plus all of the above, but any combination of values passed as strings ('1' or "1").
  * Plus all of the above, but with (correct) combinations of negative integer values.

  The following values will fail, causing compilation to abort:

  ~~~
  validate_integer(true)
  validate_integer(false)
  validate_integer(7.0)
  validate_integer({ 1 => 2 })
  $foo = undef
  validate_integer($foo)
  validate_integer($foobaridontexist)

  validate_integer(1, 0)
  validate_integer(1, true)
  validate_integer(1, '')
  validate_integer(1, undef)
  validate_integer(1, , 0)
  validate_integer(1, 2, 3)
  validate_integer(1, 3, 2)
  validate_integer(1, 3, true)
  ~~~

  * Plus all of the above, but any combination of values passed as strings ('false' or "false").
  * Plus all of the above, but with incorrect combinations of negative integer values.
  * Plus all of the above, but with non-integer items in arrays or maximum / minimum argument.

  *Type*: statement.

#### `validate_ip_address`

Validates that the argument is an IP address, regardless of it is an IPv4 or an IPv6
address. It also validates IP address with netmask. The argument must be given as a string.

The following values will pass:

  ~~~
  validate_ip_address('0.0.0.0')
  validate_ip_address('8.8.8.8')
  validate_ip_address('127.0.0.1')
  validate_ip_address('194.232.104.150')
  validate_ip_address('3ffe:0505:0002::')
  validate_ip_address('::1/64')
  validate_ip_address('fe80::a00:27ff:fe94:44d6/64')
  validate_ip_address('8.8.8.8/32')
  ~~~

The following values will fail, causing compilation to abort:

  ~~~
  validate_ip_address(1)
  validate_ip_address(true)
  validate_ip_address(0.0.0.256)
  validate_ip_address('::1', {})
  validate_ip_address('0.0.0.0.0')
  validate_ip_address('3.3.3')
  validate_ip_address('23.43.9.22/64')
  validate_ip_address('260.2.32.43')
  ~~~


#### `validate_numeric`

Validates that the first argument is a numeric value (or an array of numeric values). Aborts catalog compilation if any of the checks fail.

  The second argument is optional and passes a maximum. (All elements of) the first argument has to be less or equal to this max.

  The third argument is optional and passes a minimum. (All elements of) the first argument has to be greater or equal to this min.
  If, and only if, a minimum is given, the second argument may be an empty string or undef, which will be handled to just check
  if (all elements of) the first argument are greater or equal to the given minimum.

  It will fail if the first argument is not a numeric (Integer or Float) or array of numerics, and if arg 2 and arg 3 are not convertable to a numeric.

  For passing and failing usage, see `validate_integer()`. It is all the same for validate_numeric, yet now floating point values are allowed, too.

*Type*: statement.

#### `validate_re`

Performs simple validation of a string against one or more regular expressions. The first argument of this function should be the string to
test, and the second argument should be a stringified regular expression (without the // delimiters) or an array of regular expressions. If none of the regular expressions match the string passed in, compilation aborts with a parse error.

  You can pass a third argument as the error message raised and shown to the user.

  The following strings validate against the regular expressions:

  ~~~
  validate_re('one', '^one$')
  validate_re('one', [ '^one', '^two' ])
  ~~~

  The following string fails to validate, causing compilation to abort:

  ~~~
  validate_re('one', [ '^two', '^three' ])
  ~~~

  To set the error message:

  ~~~
  validate_re($::puppetversion, '^2.7', 'The $puppetversion fact value does not match 2.7')
  ~~~

  Note: Compilation terminates if the first argument is not a string. Always use quotes to force stringification:

  ~~~
  validate_re("${::operatingsystemmajrelease}", '^[57]$')
  ~~~

*Type*: statement.

#### `validate_slength`

Validates that the first argument is a string (or an array of strings), and is less than or equal to the length of the second argument. It fails if the first argument is not a string or array of strings, or if the second argument is not convertable to a number.  Optionally, a minimum string length can be given as the third argument.

  The following values pass:

  ~~~
  validate_slength("discombobulate",17)
  validate_slength(["discombobulate","moo"],17)
  validate_slength(["discombobulate","moo"],17,3)
  ~~~

  The following values fail:

  ~~~
  validate_slength("discombobulate",1)
  validate_slength(["discombobulate","thermometer"],5)
  validate_slength(["discombobulate","moo"],17,10)
  ~~~

*Type*: statement.

#### `validate_string`

Validates that all passed values are string data structures. Aborts catalog compilation if any value fails this check.

The following values pass:

  ~~~
  $my_string = "one two"
  validate_string($my_string, 'three')
  ~~~

  The following values fail, causing compilation to abort:

  ~~~
  validate_string(true)
  validate_string([ 'some', 'array' ])
  ~~~

*Note:* validate_string(undef) will not fail in this version of the functions API (incl. current and future parser).

Instead, use:

  ~~~
  if $var == undef {
    fail('...')
  }
  ~~~

*Type*: statement.

#### `validate_x509_rsa_key_pair`

Validates a PEM-formatted X.509 certificate and private key using OpenSSL.
Verifies that the certficate's signature was created from the supplied key.

Fails catalog compilation if any value fails this check.

Takes two arguments, the first argument must be a X.509 certificate and the
second must be an RSA private key:

  ~~~
  validate_x509_rsa_key_pair($cert, $key)
  ~~~

*Type*: statement.

#### `values`

Returns the values of a given hash. For example, given `$hash = {'a'=1, 'b'=2, 'c'=3} values($hash)` returns [1,2,3].

*Type*: rvalue.

#### `values_at`

Finds values inside an array based on location. The first argument is the array you want to analyze, and the second argument can be a combination of:

  * A single numeric index
  * A range in the form of 'start-stop' (eg. 4-9)
  * An array combining the above

  For example, `values_at(['a','b','c'], 2)` returns ['c']; `values_at(['a','b','c'], ["0-1"])` returns ['a','b']; and `values_at(['a','b','c','d','e'], [0, "2-3"])` returns ['a','c','d'].

*Type*: rvalue.

#### `zip`

Takes one element from first array given and merges corresponding elements from second array given. This generates a sequence of n-element arrays, where *n* is one more than the count of arguments. For example, `zip(['1','2','3'],['4','5','6'])` results in ["1", "4"], ["2", "5"], ["3", "6"]. *Type*: rvalue.

## Limitations

As of Puppet Enterprise 3.7, the stdlib module is no longer included in PE. PE users should install the most recent release of stdlib for compatibility with Puppet modules.

###Version Compatibility

Versions | Puppet 2.6 | Puppet 2.7 | Puppet 3.x | Puppet 4.x |
:---------------|:-----:|:---:|:---:|:----:
**stdlib 2.x**  | **yes** | **yes** | no | no
**stdlib 3.x**  | no    | **yes**  | **yes** | no
**stdlib 4.x**  | no    | **yes**  | **yes** | no
**stdlib 4.6+**  | no    | **yes**  | **yes** | **yes**
**stdlib 5.x**  | no    | no  | **yes**  | **yes**

**stdlib 5.x**: When released, stdlib 5.x will drop support for Puppet 2.7.x. Please see [this discussion](https://github.com/puppetlabs/puppetlabs-stdlib/pull/176#issuecomment-30251414).

## Development

Puppet Labs modules on the Puppet Forge are open projects, and community contributions are essential for keeping them great. We can’t access the huge number of platforms and myriad hardware, software, and deployment configurations that Puppet is intended to serve. We want to keep it as easy as possible to contribute changes so that our modules work in your environment. There are a few guidelines that we need contributors to follow so that we can have a chance of keeping on top of things. For more information, see our [module contribution guide](https://docs.puppetlabs.com/forge/contributing.html).

To report or research a bug with any part of this module, please go to
[http://tickets.puppetlabs.com/browse/PUP](http://tickets.puppetlabs.com/browse/PUP).

## Contributors

The list of contributors can be found at: [https://github.com/puppetlabs/puppetlabs-stdlib/graphs/contributors](https://github.com/puppetlabs/puppetlabs-stdlib/graphs/contributors).
