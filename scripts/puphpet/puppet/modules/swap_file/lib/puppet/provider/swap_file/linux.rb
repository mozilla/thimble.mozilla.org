Puppet::Type.type(:swap_file).provide(:linux) do

  desc "Swap file management via `swapon`, `swapoff` and `mkswap`"

  confine  :kernel   => :linux
  commands :swapon   => 'swapon'
  commands :swapoff  => 'swapoff'
  commands :mkswap   => 'mkswap'

  mk_resource_methods

  def initialize(value={})
    super(value)
    @property_flush = {}
  end

  def self.get_swap_files
    swapfiles = swapon(['-s']).split("\n")
    swapfiles.shift
    swapfiles.sort
  end

  def self.prefetch(resources)
    instances.each do |prov|
      if resource = resources[prov.name]
        resource.provider = prov
      end
    end
  end

  def self.instances
    get_swap_files.collect do |swapfile_line|
      new(get_swapfile_properties(swapfile_line))
    end
  end

  def self.get_swapfile_properties(swapfile_line)
    swapfile_properties = {}

    # swapon -s output formats thus:
    # Filename        Type    Size  Used  Priority

    # Split on spaces
    output_array = swapfile_line.strip.split(/\s+/)

    # Assign properties based on headers
    swapfile_properties = {
      :ensure => :present,
      :name => output_array[0],
      :file => output_array[0],
      :type => output_array[1],
      :size => output_array[2],
      :used => output_array[3],
      :priority => output_array[4]
    }

    swapfile_properties[:provider] = :swap_file
    Puppet.debug "Swapfile: #{swapfile_properties.inspect}"
    swapfile_properties
  end

  def exists?
    @property_hash[:ensure] == :present
  end

  def create
    @property_flush[:ensure] = :present
  end

  def destroy
    @property_flush[:ensure] = :absent
  end

  def create_swap_file(file_path)
    mk_swap(file_path)
    swap_on(file_path)
  end

  def mk_swap(file_path)
    Puppet.debug "Running `mkswap #{file_path}`"
    output = mkswap([file_path])
    Puppet.debug "Returned value: #{output}`"
  end

  def swap_on(file_path)
    Puppet.debug "Running `swapon #{file_path}`"
    output = swapon([file_path])
    Puppet.debug "Returned value: #{output}"
  end

  def swap_off(file_path)
    Puppet.debug "Running `swapoff #{file_path}`"
    output = swapoff([file_path])
    Puppet.debug "Returned value: #{output}"
  end

  def set_swapfile
    if @property_flush[:ensure] == :absent
      swap_off(resource[:name])
      return
    end

    create_swap_file(resource[:name]) unless exists?
  end

  def flush
    set_swapfile
    # Collect the resources again once they've been changed (that way `puppet
    # resource` will show the correct values after changes have been made).
    @property_hash = self.class.get_swapfile_properties(resource[:name])
  end

end
