require 'spec_helper'

type = Puppet::Type.type(:postgresql_replication_slot)
describe type.provider(:ruby) do
  let(:name) { 'standby' }
  let(:resource) do
    type.new({ :name => name, :provider => :ruby }.merge attributes)
  end

  let(:sql_instances) do
    "abc |        | physical  |        |          | t      |      |              | 0/3000420
def |        | physical  |        |          | t      |      |              | 0/3000420\n"
  end

  class SuccessStatus
    def success?
      true
    end
  end
  let(:success_status) { SuccessStatus.new }

  class FailStatus
    def success?
      false
    end
  end
  let(:fail_status) { FailStatus.new }

  let(:provider) { resource.provider }

  context 'when listing instances' do
    let(:attributes) do { } end

    it 'should list instances' do
      provider.class.expects(:run_command).with(
        ['psql', '-t', '-c', 'SELECT * FROM pg_replication_slots;'],
        'postgres', 'postgres').returns([sql_instances, nil])
      instances = provider.class.instances
      expect(instances.size).to eq 2
      expect(instances[0].name).to eq 'abc'
      expect(instances[1].name).to eq 'def'
    end
  end

  context 'when creating slot' do
    let(:attributes) do { :ensure => 'present' } end

    context 'when creation works' do
      it 'should call psql and succeed' do
        provider.class.expects(:run_command).with(
          ['psql', '-t', '-c', "SELECT * FROM pg_create_physical_replication_slot('standby');"],
          'postgres', 'postgres').returns([nil, success_status])

        expect { provider.create }.not_to raise_error
      end
    end

    context 'when creation fails' do
      it 'should call psql and fail' do
        provider.class.expects(:run_command).with(
          ['psql', '-t', '-c', "SELECT * FROM pg_create_physical_replication_slot('standby');"],
          'postgres', 'postgres').returns([nil, fail_status])

        expect { provider.create }.to raise_error(Puppet::Error, /Failed to create replication slot standby:/)
      end
    end
  end

  context 'when destroying slot' do
    let(:attributes) do { :ensure => 'absent' } end

    context 'when destruction works' do
      it 'should call psql and succeed' do
        provider.class.expects(:run_command).with(
          ['psql', '-t', '-c', "SELECT pg_drop_replication_slot('standby');"],
          'postgres', 'postgres').returns([nil, success_status])

        expect { provider.destroy }.not_to raise_error
      end
    end

    context 'when destruction fails' do
      it 'should call psql and fail' do
        provider.class.expects(:run_command).with(
          ['psql', '-t', '-c', "SELECT pg_drop_replication_slot('standby');"],
          'postgres', 'postgres').returns([nil, fail_status])

        expect { provider.destroy }.to raise_error(Puppet::Error, /Failed to destroy replication slot standby:/)
      end
    end
  end
end
