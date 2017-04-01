Puppet::Type.newtype(:datacat_collector) do
  desc %q{Manages the merging of data and updating a related resource parameter.

  The `datacat_collector` type deeply merges a data hash from
  the `datacat_fragment` resources that target it.

  These fragments are then rendered via an erb template specified by the
  `template_body` parameter and used to update the `target_field` property
  of the related `target_resource`.

  Sample usage:

    datacat_collector { 'open_ports':
      template_body => '<%= @data["ports"].sort.join(",") %>',
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


  For convenience the common use case of targeting a file is wrapped in the
  datacat defined type.}

  ensurable

  newparam(:path, :namevar => true) do
    desc "An identifier (typically a file path) that can be used by datacat_fragments so they know where to target the data."
  end

  newparam(:collects) do
    desc "Other resources we want to collect data from.  Allows for many-many datacats."
  end

  newparam(:target_resource) do
    desc "The resource that we're going to set the field (eg File['/tmp/demo']) set theto set data tor"
  end

  newparam(:target_field) do
    desc 'The field of the resource to put the results in'
  end

  newparam(:source_key) do
    desc 'If specified, the key from @data to copy across to the target_field (bypasses template evaluation)'
  end

  newparam(:template) do
    desc 'Path to the template to render.  Used in error reporting.'
  end

  newparam(:template_body) do
    desc 'The slurped body of the template to render.'
  end
end
