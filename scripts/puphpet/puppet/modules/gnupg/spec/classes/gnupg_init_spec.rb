require 'spec_helper'

describe 'gnupg', :type => :class do

  ['RedHat', 'Debian', 'Linux', 'Suse'].each do |system|
    if system == 'Linux'
      let(:facts) {{ :osfamily => 'Linux', :operatingsystem => 'Amazon' }}
    else
      let(:facts) {{ :osfamily => system }}
    end

    it { expect contain_class('gnupg::install') }

    describe "gnupg on system #{system}" do

      context "when enabled" do
        let(:params) {{
          :package_ensure => 'present',
          :package_name   => 'gnupg'
        }}

        it { expect contain_package('gnupg').with({
          'ensure' => 'present'})
        }
      end

      context 'when disabled' do
        let(:params) {{
          :package_ensure => 'absent',
          :package_name   => 'gnupg'
        }}

        it { expect contain_package('gnupg').with({
         'ensure' => 'absent'})
        }
      end
    end
  end
end
