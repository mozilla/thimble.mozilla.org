require "spec_helper"

describe Facter::Util::Fact do
  before {
    Facter.clear
  }

  describe "git_exec_path" do

    context 'windows' do
      it do
        Facter.fact(:osfamily).stubs(:value).returns('windows')
        Facter::Util::Resolution.expects(:exec).with("git --exec-path 2>nul").returns('windows_path_change')
        Facter.fact(:git_exec_path).value.should == 'windows_path_change'
      end
    end

    context 'non-windows' do
      it do
        Facter.fact(:osfamily).stubs(:value).returns('RedHat')
        Facter::Util::Resolution.expects(:exec).with("git --exec-path 2>/dev/null").returns('/usr/libexec/git-core')
        Facter.fact(:git_exec_path).value.should == '/usr/libexec/git-core'
      end
    end

  end
end