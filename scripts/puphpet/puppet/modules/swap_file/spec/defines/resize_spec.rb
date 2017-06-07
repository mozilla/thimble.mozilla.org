require 'spec_helper'

describe 'swap_file::resize' do
  let(:title) { 'default' }


  let(:default_facts) do
    {
      :operatingsystem => 'RedHat',
      :osfamily        => 'RedHat',
      :operatingsystemrelease => '7',
      :concat_basedir => '/tmp',
      :memorysize => '1.00 GB',
    }
  end

  # Add these two lines in a single test block to enable puppet and hiera debug mode
  # Puppet::Util::Log.level = :debug
  # Puppet::Util::Log.newdestination(:console)

  context 'has resize execs if swapfile outside of margin range' do
    let(:params) do
      {
        :swapfile_path          => '/mnt/swap.1',
        :expected_swapfile_size => '1 GB',
        :actual_swapfile_size   => '512 GB',
      }
    end

    it do
      is_expected.to compile.with_all_deps
    end
    it do
      is_expected.to contain_exec('Detach swap file /mnt/swap.1 for resize').
        with(
          {
            "command"=>"/sbin/swapoff /mnt/swap.1",
            "onlyif"=>"/sbin/swapon -s | grep /mnt/swap.1"
          }
        )

      is_expected.to contain_exec('Purge /mnt/swap.1 for resize').
        with(
          {
            "command"=>"/bin/rm -f /mnt/swap.1",
            "onlyif"=>"test -f /mnt/swap.1"
          }
        )
    end
  end

  context 'wont have resize execs if swapfile inside of margin range' do
    let(:params) do
      {
        :swapfile_path          => '/mnt/swap.1',
        :expected_swapfile_size => '4 GB',
        :actual_swapfile_size   => '3.9 GB',
        :margin                 => '150MB',
      }
    end

    it do
      is_expected.to compile.with_all_deps
    end
    it do
      is_expected.to_not contain_exec('Detach swap file /mnt/swap.1 for resize')
    end
    it do
      is_expected.to_not contain_exec('Purge /mnt/swap.1 for resize')
    end
  end

  context 'can get verboseness message' do
    let(:params) do
      {
        :swapfile_path          => '/mnt/swap.1',
        :expected_swapfile_size => '4 GB',
        :actual_swapfile_size   => '5 GB',
        :margin                 => '5MB',
        :verbose                => true,
      }
    end

    it do
      is_expected.to compile.with_all_deps
    end
    it do
      is_expected.to contain_exec('Detach swap file /mnt/swap.1 for resize')
    end
    it do
      is_expected.to contain_exec('Purge /mnt/swap.1 for resize')
    end
    it do
      is_expected.to contain_notify('Resizing Swapfile Alert /mnt/swap.1').with_name("Existing : 5368709120B\nExpected: 4294967296B\nMargin: 5242880B")
    end
  end

end
