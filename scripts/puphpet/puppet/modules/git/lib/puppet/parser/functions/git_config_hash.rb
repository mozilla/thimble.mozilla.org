#
# config_hash.rb
#

module Puppet::Parser::Functions
  newfunction(:git_config_hash, :type => :rvalue, :doc => <<-EOS
This function ensures the proper structure for git configuration options.
*Examples:*
    git_config_hash({"foo" => 1, "bar" => {"value" => 2}})
Would return: {"foo" => {"value" => 1}, "bar" => {"value" => 2}}
    EOS
  ) do |arguments|

    raise(Puppet::ParseError, "git_config_hash(): Wrong number of arguments " +
      "given (#{arguments.size} for 1)") if arguments.size < 1

    configs = arguments[0]

    unless configs.is_a?(Hash)
      raise(Puppet::ParseError, 'git_config_hash(): Requires hash to work with')
    end

    return Hash[configs.map {|k, v| [k, v.is_a?(Hash) ? v : {"value" => v}] }]
  end
end
