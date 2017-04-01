# When given an array of two numbers and a margin, returns true
# if the difference is less than the margin. Basically statistical
# range with a margin.
#
# @example Difference between 150 and 100 is 50, margin is 60. So true
#   $within_margin = difference_within_margin([100,150],60)
#
# @example Difference between 150 and 100 is 50, margin is 40. So false
#   $within_margin = difference_within_margin([100,150],40)
#
# @return [Boolean] whether the difference between two numbers is within in a margin
#
# @param num_a [Array] array of two numbers to compare
# @param num_b [Float] the margin to compare the two numbers
module Puppet::Parser::Functions
  newfunction(:difference_within_margin, :type => :rvalue, :doc => <<-EOS
Get's the difference between two numbers, with a third argument as a margin

*Example:*

    compare_with_margin(100,150,60)

Would result in:

    true

    compare_with_margin(100,150,40)

Would result in:

    false

    EOS
  ) do |arguments|

    # Check that more than 2 arguments have been given ...
    raise(Puppet::ParseError, "compare_with_margin(): Wrong number of arguments " +
      "given (#{arguments.size} for 2)") unless arguments.size == 2

    # Check that the first parameter is an array
    unless arguments[0].is_a?(Array)
      raise(Puppet::ParseError, 'difference_within_margin(): Requires array to work with')
    end

    # Check that the first parameter is an array
    if arguments[0].empty?
      raise(Puppet::ParseError, 'difference_within_margin(): arg[0] array cannot be empty')
    end

    arguments[0].collect! { |i| i.to_f }

    difference = arguments[0].minmax[1].to_f - arguments[0].minmax[0].to_f

    if difference < arguments[1].to_f
      return true
    else
      return false
    end
  end
end

# vim: set ts=2 sw=2 et :
