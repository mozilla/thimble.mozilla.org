require 'spec_helper'
describe 'apt::params', :type => :class do
  let(:facts) { { :lsbdistid => 'Debian', :osfamily => 'Debian', :lsbdistcodename => 'wheezy', :puppetversion => Puppet.version, } }

  # There are 4 resources in this class currently
  # there should not be any more resources because it is a params class
  # The resources are class[apt::params], class[main], class[settings], stage[main]
  it "Should not contain any resources" do
    expect(subject.call.resources.size).to eq(4)
  end

  describe "With lsb-release not installed" do
    let(:facts) { { :osfamily => 'Debian', :puppetversion => Puppet.version, } }
    let (:title) { 'my_package' }

    it do
      expect {
        subject.call
      }.to raise_error(Puppet::Error, /Unable to determine lsbdistid, please install lsb-release first/)
    end
  end
end
