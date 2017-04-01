require "spec_helper"

describe Facter::Util::Fact do
  before {
    Facter.clear
  }

  describe "git_version" do
    context 'vanilla git' do
      it do
        git_version_output = 'git version 2.1.2'
        Facter::Util::Resolution.expects(:exec).with("git --version 2>&1").returns(git_version_output)
        Facter.value(:git_version).should == "2.1.2"
      end
    end

    context 'git with hub' do
      it do
        git_version_output = <<-EOS
git version 2.1.2
hub version 1.12.2
        EOS
        Facter::Util::Resolution.expects(:exec).with("git --version 2>&1").returns(git_version_output)
        Facter.value(:git_version).should == "2.1.2"
      end
    end

    context 'no git present' do
      it do
        Facter::Util::Resolution.expects(:which).with("git").returns(false)
        Facter.value(:git_version).should be_nil
      end
    end
  end
end
