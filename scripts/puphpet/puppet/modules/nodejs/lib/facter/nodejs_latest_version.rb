require 'net/http'
require 'yaml'
require 'fileutils'
require File.join(File.dirname(__FILE__), 'nodejs_functions.rb')

Facter.add("nodejs_latest_version") do
  setcode do
    value = get_cached_value('latest_version')
    if !value
      value = get_latest_version
      set_cached_value('latest_version', value)
    end
    value
  end
end
