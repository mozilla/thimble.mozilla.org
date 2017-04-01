require File.expand_path(File.join(File.dirname(__FILE__), '..', '..', '..', 'puppet_x', 'richardc', 'datacat.rb'))

Puppet::Type.type(:datacat_collector).provide(:datacat_collector) do
  def exists?
    # Find the datacat_fragments that point at this collector
    our_names = [ resource[:path], resource[:collects] ].flatten.compact

    fragments = resource.catalog.resources.find_all do |r|
      r.is_a?(Puppet::Type.type(:datacat_fragment)) && ((our_names & [ r[:target] ].flatten).size > 0)
    end

    # order fragments on their :order property
    fragments = fragments.sort { |a,b| a[:order] <=> b[:order] }

    # deep merge their data chunks
    deep_merge = Puppet_X::Richardc::Datacat.deep_merge
    data = {}
    fragments.each do |fragment|
      data.merge!(fragment[:data], &deep_merge)
    end

    debug "Collected #{data.inspect}"

    if @resource[:source_key]
      debug "Selecting source_key #{@resource[:source_key]}"
      content = data[@resource[:source_key]]
    else
      vars = Puppet_X::Richardc::Datacat_Binding.new(data, resource[:template])

      debug "Applying template #{@resource[:template]}"
      template = ERB.new(@resource[:template_body] || '', 0, '-')
      template.filename = @resource[:template]
      content = template.result(vars.get_binding)
    end

    # Find the resource to modify
    target_resource = resolve_resource(@resource[:target_resource])
    target_field    = @resource[:target_field].to_sym

    unless target_resource.is_a?(Puppet::Type)
      raise "Failed to map #{@resource[:target_resource]} into a resource, got to #{target_resource.inspect} of class #{target_resource.class}"
    end

    debug "Now setting field #{target_field.inspect}"
    target_resource[target_field] = content

    # and claim there's nothing to change about *this* resource
    true
  end

  private

  def resolve_resource(reference)
    if reference.is_a?(Puppet::Type)
      # Probably from a unit test, use the resource as-is
      return reference
    end

    if reference.is_a?(Puppet::Resource)
      # Already part resolved - puppet apply?
      # join it to the catalog where we live and ask it to resolve
      reference.catalog = resource.catalog
      return reference.resolve
    end

    if reference.is_a?(String)
      # 3.3.0 catalogs you need to resolve like so
      return resource.catalog.resource(reference)
    end

    # If we got here, panic
    raise "Don't know how to convert '#{reference.inspect}' of class #{reference.class} into a resource"
  end
end
