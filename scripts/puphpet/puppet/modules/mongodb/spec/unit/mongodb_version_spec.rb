require "spec_helper"

describe Facter::Util::Fact do
  before {
    Facter.clear
  }

  describe "mongodb_version" do
    context 'with value' do
      before :each do
        Facter::Core::Execution.stubs(:which).with('mongo').returns(true)
        Facter::Core::Execution.stubs(:execute).with('mongo --version 2>&1').returns('MongoDB shell version: 3.2.1')
      end
      it {
        expect(Facter.fact(:mongodb_version).value).to eq('3.2.1')
      }
    end
  end
end
