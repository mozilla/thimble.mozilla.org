require "spec_helper"

describe Facter::Util::Fact do
  before {
    Facter.clear
  }

  describe "git_html_path" do

    context 'windows' do
      it do
        Facter.fact(:osfamily).stubs(:value).returns('windows')
        Facter::Util::Resolution.expects(:exec).with("git --html-path 2>nul").returns('windows_path_change')
        Facter.fact(:git_html_path).value.should == 'windows_path_change'
      end
    end

    context 'non-windows' do
      it do
        Facter.fact(:osfamily).stubs(:value).returns('RedHat')
        Facter::Util::Resolution.expects(:exec).with("git --html-path 2>/dev/null").returns('/usr/share/doc/git-1.7.1')
        Facter.fact(:git_html_path).value.should == '/usr/share/doc/git-1.7.1'
      end
    end

  end
end