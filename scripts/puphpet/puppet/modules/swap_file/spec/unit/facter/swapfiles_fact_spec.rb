require "spec_helper"

describe Facter::Util::Fact do
  before {
    Facter.clear
  }

  describe 'swapfile_sizes' do
    context 'returns swapfile_sizes when present' do
      before do
        Facter.fact(:kernel).stubs(:value).returns("Linux")
        File.stubs(:exists?)
        File.expects(:exists?).with('/proc/swaps').returns(true)
        Facter::Util::Resolution.stubs(:exec)
      end
      it do
        proc_swap_output = <<-EOS
Filename        Type    Size  Used  Priority
/dev/dm-1                               partition 524284  0 -1
/mnt/swap.1                             file      204796  0 -2
/tmp/swapfile.fallocate                 file      204796  0 -3
        EOS
        Facter::Util::Resolution.expects(:exec).with('cat /proc/swaps').returns(proc_swap_output)
        expect(Facter.value(:swapfile_sizes)).to eq(
          {
            "/mnt/swap.1"=>"204796",
            "/tmp/swapfile.fallocate"=>"204796"
          }
        )
      end
    end

  end
end
