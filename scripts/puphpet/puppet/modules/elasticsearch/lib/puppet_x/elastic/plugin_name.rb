module Puppet_X
  module Elastic
    # Attempt to guess at the plugin's final directory name
    def self.plugin_name(original_string)
      vendor, plugin, _version = original_string.split('/')

      if plugin.nil?
        # Not delineated by slashes; single plugin name in the style of
        # commercial plugins post-2.x
        vendor
      else # strip off potential es prefixes and return the plugin name
        plugin.gsub(/(elasticsearch-|es-)/, '')
      end
    end
  end # of Elastic
end # of Puppet_X
