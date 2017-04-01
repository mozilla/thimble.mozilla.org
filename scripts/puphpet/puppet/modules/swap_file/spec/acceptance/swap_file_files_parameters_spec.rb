require 'spec_helper_acceptance'

describe 'swap_file::files defined type', :unless => UNSUPPORTED_PLATFORMS.include?(fact('osfamily')) do

  context 'swap_file' do
    context 'custom parameters' do
      it 'should work with no errors' do
        pp = <<-EOS
        swap_file::files { 'tmp file swap':
          ensure   => present,
          swapfile => '/tmp/swapfile',
        }
        EOS

        apply_manifest(pp, :catch_failures => true)
        apply_manifest(pp, :catch_changes  => true)
      end
      it 'should contain the given swapfile' do
        if ["FreeBSD"].include?(fact('osfamily'))
          shell('/usr/sbin/swapinfo | grep /dev/md99', :acceptable_exit_codes => [0])
        else
          shell('/sbin/swapon -s | grep /tmp/swapfile', :acceptable_exit_codes => [0])
        end
      end
      it 'should contain the given fstab setting' do
        shell('cat /etc/fstab | grep /tmp/swapfile', :acceptable_exit_codes => [0])
        if ["FreeBSD"].include?(fact('osfamily'))
          shell('cat /etc/fstab | grep md99', :acceptable_exit_codes => [0])
        else
          shell('cat /etc/fstab | grep defaults', :acceptable_exit_codes => [0])
        end
      end
    end
  end
end
