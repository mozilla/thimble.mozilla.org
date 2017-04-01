Puppet::Type.newtype(:elasticsearch_plugin) do

  @doc = "Plugin installation type"

  ensurable do
    defaultvalues
    defaultto :present
  end

  newparam(:name, :namevar => true) do
    desc 'An arbitrary name used as the identity of the resource.'
  end

  newparam(:url) do
    desc 'Url of the package'
  end

  newparam(:source) do
    desc 'Source of the package. puppet:// or file:// resource'
  end

  newparam(:proxy) do
    desc 'Proxy Host'
  end

  newparam(:plugin_dir) do
    desc 'Path to the Plugins directory'
    defaultto '/usr/share/elasticsearch/plugins'
  end

  newparam(:plugin_path) do
    desc 'Override name of the directory created for the plugin'
  end

end
