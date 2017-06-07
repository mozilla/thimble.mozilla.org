#
# dig.rb
#

module Puppet::Parser::Functions
  newfunction(:dig, :type => :rvalue, :doc => <<-EOS
Looks up into a complex structure of arrays and hashes and returns nil
or the default value if nothing was found.

Path is an array of keys to be looked up in data argument. The function
will go down the structure and try to extract the required value.

$data = {
  'a' => {
    'b' => [
      'b1',
      'b2',
      'b3' ]}}

$value = dig($data, ['a', 'b', '2'], 'not_found')
=> $value = 'b3'

a -> first hash key
b -> second hash key
2 -> array index starting with 0

not_found -> (optional) will be returned if there is no value or the path
did not match. Defaults to nil.

In addition to the required "path" argument, "dig" accepts default
argument. It will be returned if no value was found or a path component is
missing. And the fourth argument can set a variable path separator.
    EOS
             ) do |arguments|
    # Two arguments are required
    raise(Puppet::ParseError, "dig(): Wrong number of arguments " +
                              "given (#{arguments.size} for at least 2)") if arguments.size < 2

    data, path, default = *arguments

    if !(data.is_a?(Hash) || data.is_a?(Array))
      raise(Puppet::ParseError, "dig(): first argument must be a hash or an array, " <<
                                "given #{data.class.name}")
    end

    unless path.is_a? Array
      raise(Puppet::ParseError, "dig(): second argument must be an array, " <<
                                "given #{path.class.name}")
    end

    value = path.reduce(data) { |h, k| (h.is_a?(Hash) || h.is_a?(Array)) ? h[k] : break }
    value.nil? ? default : value
  end
end
