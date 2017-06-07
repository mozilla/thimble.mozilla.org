# Custom Puppet function to convert unix to dos format
module Puppet::Parser::Functions
  newfunction(:unix2dos, :type => :rvalue, :arity => 1, :doc => <<-EOS
    Returns the DOS version of the given string.
    Takes a single string argument.
    EOS
  ) do |arguments|

    unless arguments[0].is_a?(String)
      raise(Puppet::ParseError, 'unix2dos(): Requires string as argument')
    end

    arguments[0].gsub(/\r*\n/, "\r\n")
  end
end
