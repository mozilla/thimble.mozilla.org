require 'spec_helper_acceptance'

describe 'swap_file class', :unless => UNSUPPORTED_PLATFORMS.include?(fact('osfamily')) do

  context 'swap_file' do
    context 'ensure => present' do
      it 'should work with no errors' do
        pp = <<-EOS
        class { 'swap_file':
          files => {
            'swapfile' => {
              ensure => 'present',
            },
            'use fallocate' => {
              swapfile => '/tmp/swapfile.fallocate',
              cmd      => 'fallocate',
            },
            'remove swap file' => {
              ensure   => 'absent',
              swapfile => '/tmp/swapfile.old',
            },
          },
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
      it 'should contain the default swapfile' do
        shell('/sbin/swapon -s | grep /tmp/swapfile.fallocate', :acceptable_exit_codes => [0])
      end
      it 'should contain the default fstab setting' do
        shell('cat /etc/fstab | grep /tmp/swapfile.fallocate', :acceptable_exit_codes => [0])
      end
    end
  end
end
