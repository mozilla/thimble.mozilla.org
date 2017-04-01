Puppet types for concatenating data via a template
==================================================

The `datacat` and `datacat_fragment` types allow you to build up a data
structure which is rendered using a template.  This is similar to some of the
common concatenation patterns though the intent should be clearer as it pushes
the boilerplate down into the type.

[![Build Status](https://travis-ci.org/richardc/puppet-datacat.png)](https://travis-ci.org/richardc/puppet-datacat)

Sample Usage
------------

```puppet
datacat { '/etc/nagios/objects/hostgroups.cfg':
  template => "${module_name}/hostgroups.cfg.erb",
}

datacat_fragment { "${::fqdn} in device hostgroup":
  target => '/etc/nagios/objects/hostgroups.cfg',
  data   => {
    device => [ $::fqdn ],
  },
}

# fred.dc1.notreal has an ilo fred-ilo.dc1.notreal
$ilo_fqdn = regsubst($::fqdn, '\.', '-ilo.')
datacat_fragment { "${ilo_fqdn} in device hostgroup":
  target => '/etc/nagios/objects/hostgroups.cfg',
  data   => {
    device => [ $ilo_fqdn ],
  },
}
```

And then in your `hostgroups.cfg.erb`

```erb
# hostgroups.cfg.erb
<% @data.keys.sort.each do |hostgroup| %>
define hostgroup {
    name <%= hostgroup %>
    members <%= @data[hostgroup].sort.join(',') %>
}
<% end %>
```

Will produce something like:

```
# /etc/nagios/objects/hostgroups.cfg
define hostgroup {
    name device
    members fred.dc1.notreal,fred-ilo.dc1.notreal
}
```

There are additional samples in a blog post I wrote to describe the approach,
http://richardc.unixbeard.net/2013/02/puppet-concat-patterns/

Types and Definitions
---------------------

## Defined Type: `datacat`

Wraps the `datacat_collector` and `file` types to cover the most common
use-case, collecting data for and templating an entire file.

The `ensure` parameter defaults to `file` (an alias for `present`). `ensure`
can be set to `absent`. In that case `datacat` will make sure the file *does
not exist* and will not collect anything with `datacat_collector`.

## Type: `datacat_collector`

The `datacat_collector` type deeply merges a data hash from
the `datacat_fragment` resources that target it.

These fragments are then rendered via an erb template specified by the
`template_body` parameter and used to update the `target_field` property
of the related `target_resource`.

Sample usage:

```puppet
datacat_collector { 'open_ports':
  template_body   => '<%= @data["ports"].sort.join(",") %>',
  target_resource => File_line['open_ports'],
  target_field    => 'line',
}

datacat_fragment { 'open webserver':
  target => 'open_ports',
  data   => { ports => [ 80, 443 ] },
}

datacat_fragment { 'open ssh':
  target => 'open_ports',
  data   => { ports => [ 22 ] },
}
```

Caveats
-------

The template is evaluated by the agent at the point of catalog evaluation,
this means you cannot call out to puppet parser functions as you would when
using the usual `template()` function.


Copyright and License
---------------------

Copyright (C) 2013 Richard Clamp

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
