if File.exists?('/proc/swaps')
  swap_file_array = []

  swap_file_output = Facter::Util::Resolution.exec('cat /proc/swaps')

    # Sample Output
    # Filename                                Type    Size  Used  Priority
    # /dev/dm-1                               partition 524284  0 -1
    # /mnt/swap.1                             file    204796  0 -2
    # /tmp/swapfile.fallocate                 file    204796  0 -3
    swap_file_output_array = swap_file_output.split("\n")

    # Remove the header line
    swap_file_output_array.shift

    swap_file_output_array.each do |line|

      swap_file_line_array = line.gsub(/\s+/m, ' ').strip.split(" ")

      # We only want swap-file information, not paritions
      if swap_file_line_array[1] == 'file'
        pipe_seperated_string = "#{swap_file_line_array[0]}||#{swap_file_line_array[2]}"
        swap_file_array << pipe_seperated_string
      end

    end

    swapfile_csv = swap_file_array.join(',')

    Facter.add('swapfile_sizes_csv') do
      confine :kernel => 'Linux'
      setcode do
        swapfile_csv
      end
    end

end
