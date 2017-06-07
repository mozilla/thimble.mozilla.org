require 'spec_helper'

describe 'apt_reboot_required fact' do
  subject { Facter.fact(:apt_reboot_required).value }
  after(:each) { Facter.clear }

  describe 'if a reboot is required' do
    before {
      Facter.fact(:osfamily).expects(:value).at_least(1).returns 'Debian'
      File.stubs(:file?).returns true
      File.expects(:file?).at_least(1).with('/var/run/reboot-required').returns true
    }
    it { is_expected.to eq true }
  end

  describe 'if a reboot is not required' do
    before {
      Facter.fact(:osfamily).expects(:value).at_least(1).returns 'Debian'
      File.stubs(:file?).returns true
      File.expects(:file?).at_least(1).with('/var/run/reboot-required').returns false
    }
    it { is_expected.to eq false }
  end

end
