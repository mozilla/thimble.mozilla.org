require 'spec_helper_acceptance'

describe 'swap_file::files defined type', :unless => UNSUPPORTED_PLATFORMS.include?(fact('osfamily')) do

  context 'swap_file' do
    context 'ensure => present' do
      it 'should work with no errors' do
        pp = <<-EOS
        swap_file::files { 'default':
          ensure   => present,
        }
        EOS

        # Run it twice and test for idempotency
        apply_manifest(pp, :catch_failures => true)
        apply_manifest(pp, :catch_changes  => true)
      end
      it 'should contain the default swapfile' do
        shell('/sbin/swapon -s | grep /mnt/swap.1', :acceptable_exit_codes => [0])
      end
      it 'should contain the default fstab setting' do
        shell('cat /etc/fstab | grep /mnt/swap.1', :acceptable_exit_codes => [0])
        shell('cat /etc/fstab | grep defaults', :acceptable_exit_codes => [0])
      end
    end
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
        shell('/sbin/swapon -s | grep /tmp/swapfile', :acceptable_exit_codes => [0])
      end
      it 'should contain the default fstab setting' do
        shell('cat /etc/fstab | grep /tmp/swapfile', :acceptable_exit_codes => [0])
        shell('cat /etc/fstab | grep defaults', :acceptable_exit_codes => [0])
      end
    end
    context 'multiple swap_file::files' do
      it 'should work with no errors' do
        pp = <<-EOS
        swap_file::files { 'tmp file swap 1':
          ensure   => present,
          swapfile => '/tmp/swapfile1',
        }

        swap_file::files { 'tmp file swap 2':
          ensure   => present,
          swapfile => '/tmp/swapfile2',
        }
        EOS

        apply_manifest(pp, :catch_failures => true)
        apply_manifest(pp, :catch_changes  => true)
      end
      it 'should contain the given swapfiles' do
        shell('/sbin/swapon -s | grep /tmp/swapfile1', :acceptable_exit_codes => [0])
        shell('/sbin/swapon -s | grep /tmp/swapfile2', :acceptable_exit_codes => [0])
      end
      it 'should contain the default fstab setting' do
        shell('cat /etc/fstab | grep /tmp/swapfile1', :acceptable_exit_codes => [0])
        shell('cat /etc/fstab | grep /tmp/swapfile2', :acceptable_exit_codes => [0])
      end
    end
  end
end
