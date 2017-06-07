require 'spec_helper'

describe 'archive::staging' do
  context 'RHEL Puppet opensource' do
    let(:facts) { { osfamily: 'RedHat', puppetversion: '3.7.3' } }

    it { should contain_class 'archive' }
    it do
      should contain_file('/opt/staging').with(
        owner: '0',
        group: '0',
        mode: '0640'
      )
    end
  end

  context 'RHEL Puppet opensource with params' do
    let(:facts) { { osfamily: 'RedHat', puppetversion: '3.7.3' } }

    let(:params) do
      {
        path: '/tmp/staging',
        owner: 'puppet',
        group: 'puppet',
        mode: '0755'
      }
    end

    it { should contain_class 'archive' }
    it do
      should contain_file('/tmp/staging').with(
        owner: 'puppet',
        group: 'puppet',
        mode: '0755'
      )
    end
  end

  context 'Windows Puppet Enterprise' do
    let(:facts) do
      {
        osfamily: 'Windows',
        puppetversion: '3.4.3 (Puppet Enterprise 3.2.3)',
        archive_windir: 'C:/Windows/Temp/staging'
      }
    end

    it { should contain_class 'archive' }
    it do
      should contain_file('C:/Windows/Temp/staging').with(
        owner: 'S-1-5-32-544',
        group: 'S-1-5-18',
        mode: '0640'
      )
    end
  end
end
