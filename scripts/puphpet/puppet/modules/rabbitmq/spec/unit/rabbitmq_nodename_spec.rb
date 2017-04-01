require "spec_helper"

describe Facter::Util::Fact do
  before {
    Facter.clear
  }

  describe "rabbitmq_nodename" do
    context 'with value' do
      before :each do
        Facter::Core::Execution.stubs(:which).with('rabbitmqctl').returns(true)
        Facter::Core::Execution.stubs(:execute).with('rabbitmqctl status 2>&1').returns('Status of node monty@rabbit1 ...')
      end
      it {
        expect(Facter.fact(:rabbitmq_nodename).value).to eq('monty@rabbit1')
      }
    end

    context 'with dashes in hostname' do
      before :each do
        Facter::Core::Execution.stubs(:which).with('rabbitmqctl').returns(true)
        Facter::Core::Execution.stubs(:execute).with('rabbitmqctl status 2>&1').returns('Status of node monty@rabbit-1 ...')
      end
      it {
        expect(Facter.fact(:rabbitmq_nodename).value).to eq('monty@rabbit-1')
      }
    end

    context 'with quotes around node name' do
      before :each do
        Facter::Core::Execution.stubs(:which).with('rabbitmqctl').returns(true)
        Facter::Core::Execution.stubs(:execute).with('rabbitmqctl status 2>&1').returns('Status of node \'monty@rabbit-1\' ...')
      end
      it {
        expect(Facter.fact(:rabbitmq_nodename).value).to eq('monty@rabbit-1')
      }
    end
  end
end
