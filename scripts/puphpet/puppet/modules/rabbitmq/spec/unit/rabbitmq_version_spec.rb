require "spec_helper"

describe Facter::Util::Fact do
  before {
    Facter.clear
  }

  describe "rabbitmq_version" do
    context 'with value' do
      before :each do
        Facter::Core::Execution.stubs(:which).with('rabbitmqadmin').returns(true)
        Facter::Core::Execution.stubs(:execute).with('rabbitmqadmin --version 2>&1').returns('rabbitmqadmin 3.6.0')
      end
      it {
        expect(Facter.fact(:rabbitmq_version).value).to eq('3.6.0')
      }
    end
  end
end
