require 'spec_helper'

describe 'swap_file::files' do
  let(:title) { 'default' }

  let(:facts) do
    {
      operatingsystem: 'RedHat',
      osfamily: 'RedHat',
      operatingsystemrelease: '7',
      concat_basedir: '/tmp',
      memorysize: '1.00 GB'
    }
  end

  # Add these two lines in a single test block to enable puppet and hiera debug mode
  # Puppet::Util::Log.level = :debug
  # Puppet::Util::Log.newdestination(:console)

  context 'default parameters' do
    it do
      is_expected.to compile.with_all_deps
    end
    it do
      is_expected.to contain_exec('Create swap file /mnt/swap.1')
        .with('command' => '/bin/dd if=/dev/zero of=/mnt/swap.1 bs=1M count=1024',
              'creates' => '/mnt/swap.1')
    end
    it do
      is_expected.to contain_file('/mnt/swap.1')
        .with('owner' => 'root',
              'group' => 'root',
              'mode' => '0600',
              'require' => 'Exec[Create swap file /mnt/swap.1]')
    end
    it do
      is_expected.to contain_swap_file('/mnt/swap.1')
    end
    it do
      is_expected.to contain_mount('/mnt/swap.1')
        .with('require' => 'Swap_file[/mnt/swap.1]')
    end
  end

  context 'custom swapfilesize parameter' do
    let(:params) do
      {
        swapfilesize: '4.1 GB'
      }
    end
    it do
      is_expected.to compile.with_all_deps
    end
    it do
      is_expected.to contain_exec('Create swap file /mnt/swap.1')
        .with('command' => '/bin/dd if=/dev/zero of=/mnt/swap.1 bs=1M count=4198',
              'creates' => '/mnt/swap.1')
    end
  end

  context 'custom swapfilesize parameter with timeout' do
    let(:params) do
      {
        swapfile: '/mnt/swap.2',
        swapfilesize: '4.1 GB',
        timeout: 900
      }
    end
    it do
      is_expected.to compile.with_all_deps
    end
    it do
      is_expected.to contain_exec('Create swap file /mnt/swap.2')
        .with('command' => '/bin/dd if=/dev/zero of=/mnt/swap.2 bs=1M count=4198',
              'timeout' => 900, 'creates' => '/mnt/swap.2')
    end
  end

  context 'custom swapfilesize parameter with timeout' do
    let(:params) do
      {
        swapfile: '/mnt/swap.2',
        swapfilesize: '4.1 GB',
        timeout: 900
      }
    end
    it do
      is_expected.to compile.with_all_deps
    end
    it do
      is_expected.to contain_exec('Create swap file /mnt/swap.2')
        .with('command' => '/bin/dd if=/dev/zero of=/mnt/swap.2 bs=1M count=4198',
              'timeout' => 900, 'creates' => '/mnt/swap.2')
    end
  end

  context 'custom swapfilesize parameter with fallocate' do
    let(:params) do
      {
        swapfile: '/mnt/swap.3',
        swapfilesize: '4.1 GB',
        cmd: 'fallocate'
      }
      it do
        is_expected.to compile.with_all_deps
      end
      is_expected.to contain_exec('Create swap file /mnt/swap.3')
        .with(
          'command' => '/usr/bin/fallocate -l 4198M /mnt/swap.3',
          'creates' => '/mnt/swap.3'
        )
    end
  end

  context 'with cmd set to invalid value' do
    let(:params) do
      {
        cmd: 'invalid'
      }
    end
    it 'should fail' do
      expect { should contain_class(subject) }.to raise_error(Puppet::Error, /Invalid cmd: invalid - \(Must be \'dd\' or \'fallocate\'\)/)
    end
  end

  context 'resize_existing => true' do

    let(:existing_swap_kb) { '204796' } # 200MB

    context 'when swapfile_sizes fact exists and matches path' do
      let(:params) do
        {
          swapfile: '/mnt/swap.resizeme',
          resize_existing: true
        }
      end

      let(:facts) do
        {
          operatingsystem: 'RedHat',
          osfamily: 'RedHat',
          operatingsystemrelease: '7',
          concat_basedir: '/tmp',
          memorysize: '1.00 GB',
          swapfile_sizes: {
            '/mnt/swap.resizeme' => existing_swap_kb,
          },
          swapfile_sizes_csv: "/mnt/swap.resizeme||#{existing_swap_kb}",
        }
      end

      it do
        is_expected.to compile.with_all_deps
      end
      it do
        should contain_swap_file__resize('/mnt/swap.resizeme').with('swapfile_path' => '/mnt/swap.resizeme',
                                                                    'margin'                 => '50MB',
                                                                    'expected_swapfile_size' => '1.00 GB',
                                                                    'actual_swapfile_size'   => existing_swap_kb,
                                                                    'before'                 => 'Exec[Create swap file /mnt/swap.resizeme]')
      end
      it do
        is_expected.to contain_exec('Create swap file /mnt/swap.resizeme')
          .with('command' => '/bin/dd if=/dev/zero of=/mnt/swap.resizeme bs=1M count=1024',
                'creates' => '/mnt/swap.resizeme')
      end
      it do
        is_expected.to contain_file('/mnt/swap.resizeme')
          .with('owner' => 'root',
                'group' => 'root',
                'mode' => '0600',
                'require' => 'Exec[Create swap file /mnt/swap.resizeme]')
      end
      it do
        is_expected.to contain_swap_file('/mnt/swap.resizeme')
          .with('ensure' => 'present')
      end
      it do
        is_expected.to contain_mount('/mnt/swap.resizeme')
          .with('require' => 'Swap_file[/mnt/swap.resizeme]')
      end
    end
    context 'when swapfile_sizes fact does not exist' do
      let(:params) do
        {
          swapfile: '/mnt/swap.nofact',
          resize_existing: true
        }
      end
      let(:facts) do
        {
          operatingsystem: 'RedHat',
          osfamily: 'RedHat',
          operatingsystemrelease: '7',
          concat_basedir: '/tmp',
          memorysize: '1.00 GB',
          swapfile_sizes: nil,
        }
      end
      it do
        is_expected.to compile.with_all_deps
      end
      it do
        should_not contain_swap_file__resize('/mnt/swap.nofact')
      end
    end
    context 'when swapfile_sizes fact exits but file does not match' do
      let(:params) do
        {
          swapfile: '/mnt/swap.factbutnomatch',
          resize_existing: true
        }
      end
      let(:facts) do
        {
          operatingsystem: 'RedHat',
          osfamily: 'RedHat',
          operatingsystemrelease: '7',
          concat_basedir: '/tmp',
          memorysize: '1.00 GB',
          swapfile_sizes: {
            '/mnt/swap.differentname' => '204796', # 200MB
          },
          swapfile_sizes_csv: "/mnt/swap.differentname||#{existing_swap_kb}",
        }
      end
      it do
        is_expected.to compile.with_all_deps
      end
      it do
        is_expected.to contain_exec('Create swap file /mnt/swap.factbutnomatch')
          .with(
            'command' => '/bin/dd if=/dev/zero of=/mnt/swap.factbutnomatch bs=1M count=1024',
            'creates' => '/mnt/swap.factbutnomatch'
          )
      end
      it do
        should_not contain_swap_file__resize('/mnt/swap.factbutnomatch')
      end
    end
    context 'when swapfile_sizes fact exists and matches path, but not hash' do
      let(:params) do
        {
          swapfile: '/mnt/swap.resizeme',
          resize_existing: true
        }
      end

      let(:existing_swap_kb) { '204796' } # 200MB

      let(:facts) do
        {
          operatingsystem: 'RedHat',
          osfamily: 'RedHat',
          operatingsystemrelease: '7',
          concat_basedir: '/tmp',
          memorysize: '1.00 GB',
          swapfile_sizes: "/mnt/swap.resizeme#{existing_swap_kb}",
          swapfile_sizes_csv: "/mnt/swap.resizeme||#{existing_swap_kb}",
        }
      end

      it do
        is_expected.to compile.with_all_deps
      end
      it do
        should contain_swap_file__resize('/mnt/swap.resizeme').with('swapfile_path' => '/mnt/swap.resizeme',
                                                                    'margin'                 => '50MB',
                                                                    'expected_swapfile_size' => '1.00 GB',
                                                                    'actual_swapfile_size'   => existing_swap_kb,
                                                                    'before'                 => 'Exec[Create swap file /mnt/swap.resizeme]')
      end
      it do
        is_expected.to contain_exec('Create swap file /mnt/swap.resizeme')
          .with('command' => '/bin/dd if=/dev/zero of=/mnt/swap.resizeme bs=1M count=1024',
                'creates' => '/mnt/swap.resizeme')
      end
      it do
        is_expected.to contain_file('/mnt/swap.resizeme')
          .with('owner' => 'root',
                'group' => 'root',
                'mode' => '0600',
                'require' => 'Exec[Create swap file /mnt/swap.resizeme]')
      end
      it do
        is_expected.to contain_swap_file('/mnt/swap.resizeme')
          .with('ensure' => 'present')
      end
      it do
        is_expected.to contain_mount('/mnt/swap.resizeme')
          .with('require' => 'Swap_file[/mnt/swap.resizeme]')
      end
    end
    context 'when swapfile_sizes fact does not exist' do
      let(:params) do
        {
          swapfile: '/mnt/swap.nofact',
          resize_existing: true
        }
      end
      let(:facts) do
        {
          operatingsystem: 'RedHat',
          osfamily: 'RedHat',
          operatingsystemrelease: '7',
          concat_basedir: '/tmp',
          memorysize: '1.00 GB',
          swapfile_sizes: nil,
          swapfile_sizes_csv: nil,
        }
      end
      it do
        is_expected.to compile.with_all_deps
      end
      it do
        should_not contain_swap_file__resize('/mnt/swap.nofact')
      end
    end
    context 'when swapfile_sizes fact exits but file does not match' do
      let(:params) do
        {
          swapfile: '/mnt/swap.factbutnomatch',
          resize_existing: true
        }
      end
      let(:facts) do
        {
          operatingsystem: 'RedHat',
          osfamily: 'RedHat',
          operatingsystemrelease: '7',
          concat_basedir: '/tmp',
          memorysize: '1.00 GB',
          swapfile_sizes: "/mnt/swap.differentname#{existing_swap_kb}",
          swapfile_sizes_csv: "/mnt/swap.differentname||#{existing_swap_kb}",
        }
      end
      it do
        is_expected.to compile.with_all_deps
      end
      it do
        is_expected.to contain_exec('Create swap file /mnt/swap.factbutnomatch')
          .with(
            'command' => '/bin/dd if=/dev/zero of=/mnt/swap.factbutnomatch bs=1M count=1024',
            'creates' => '/mnt/swap.factbutnomatch'
          )
      end
      it do
        should_not contain_swap_file__resize('/mnt/swap.factbutnomatch')
      end
    end
  end

end
