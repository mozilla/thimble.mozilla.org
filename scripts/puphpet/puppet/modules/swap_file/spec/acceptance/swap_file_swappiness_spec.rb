require 'spec_helper_acceptance'

describe 'swap_file::swappiness class', :unless => UNSUPPORTED_PLATFORMS.include?(fact('osfamily')) do

  context 'swap_file::swappiness' do
    context 'swappiness => 75, permanent => false' do
      it 'should work with no errors' do
        pp = <<-EOS
        class { 'swap_file::swappiness':
          swappiness => 75,
        }
        EOS

        # Run it twice and test for idempotency
        apply_manifest(pp, :catch_failures => true)
        apply_manifest(pp, :catch_changes  => true)
      end
      it 'should set the swappiness to 75 in a seperate sysctl file' do
        shell('/bin/cat /proc/sys/vm/swappiness | grep 75', :acceptable_exit_codes => [0])
      end
    end
  end

end
