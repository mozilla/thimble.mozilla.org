#
# swap_file_size_from_csv.rb
#
module Puppet::Parser::Functions
  newfunction(:swap_file_size_from_csv, :type => :rvalue, :doc => <<-EOS
Given a csv of swap files and sizes, split by pipe (||), we can determine the size in bytes of the swapfile
Will return false if the swapfile is not found in the csv
*Examples:*
    get_swap_file_size_from_csv('/mnt/swap.1','/mnt/swap.1||1019900,/mnt/swap.1||1019900')
Would return: 1019900
    get_swap_file_size_from_csv('/mnt/swap.2','/mnt/swap.1||1019900,/mnt/swap.1||1019900')
Would return: false
    EOS
  ) do |arguments|
    raise(Puppet::ParseError, "swap_file_size_from_csv(): Wrong number of arguments " +
      "given (#{arguments.size} for 2)") if arguments.size < 2
    unless arguments[0].is_a? String
      raise(Puppet::ParseError, "swap_file_size_from_csv(): swapfile name but be a string (Got #{arguments[0].class}")
    end
    unless arguments[1].is_a? String
      raise(Puppet::ParseError, "swap_file_size_from_csv(): Requires string to work with (Got #{arguments[1].class}")
    end
    lines = arguments[1].strip.split(',')

    swapfile_found = false

    lines.each do | swapfile_csv |
      swapfile_csv_array = swapfile_csv.split(',')
      swapfile_name = swapfile_csv.split('||')[0]
      swapfile_size = swapfile_csv.split('||')[1]
      swapfile_found = swapfile_size if arguments[0] == swapfile_name
    end
    swapfile_found
  end
end
# vim: set ts=2 sw=2 et :
