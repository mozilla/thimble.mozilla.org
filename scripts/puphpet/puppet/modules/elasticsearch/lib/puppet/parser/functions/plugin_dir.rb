module Puppet::Parser::Functions
  newfunction(:plugin_dir, :type => :rvalue, :doc => <<-EOS
    Extracts the end plugin directory of the name
    EOS
  ) do |arguments|

    if arguments.size < 1 then
      raise(Puppet::ParseError, "plugin_dir(): No arguments given")
    elsif arguments.size > 2 then
      raise(Puppet::ParseError, "plugin_dir(): Too many arguments given (#{arguments.size})")
    else

      unless arguments[0].is_a?(String)
        raise(Puppet::ParseError, 'plugin_dir(): Requires string as first argument')
      end

      plugin_name = arguments[0]
      items = plugin_name.split("/")

      if items.count == 1
        endname = items[0]
      elsif items.count > 1
        plugin = items[1]
        if plugin.include?('-') # example elasticsearch-head
          if plugin.start_with?('elasticsearch-')
            endname = plugin.gsub('elasticsearch-', '')
          elsif plugin.start_with?('es-')
            endname = plugin.gsub('es-', '')
          else
            endname = plugin
          end
        else
          endname = plugin
        end
      else
        raise(Puppet::ParseError, "Unable to parse plugin name: #{plugin_name}")
      end

      return endname

    end
  end
end
