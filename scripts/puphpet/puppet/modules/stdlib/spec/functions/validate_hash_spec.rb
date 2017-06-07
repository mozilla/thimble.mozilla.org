require 'spec_helper'

describe 'validate_hash' do
  describe 'signature validation' do
    it { is_expected.not_to eq(nil) }
    it { is_expected.to run.with_params().and_raise_error(Puppet::ParseError, /wrong number of arguments/i) }

    describe 'valid inputs' do
      it { is_expected.to run.with_params({}) }
      it { is_expected.to run.with_params({'key' => 'value'}) }
      it { is_expected.to run.with_params({}, {'key' => 'value'}) }
      it { is_expected.to run.with_params({'key1' => 'value1'}, {'key2' => 'value2'}) }
    end

    describe 'invalid inputs' do
      it { is_expected.to run.with_params([]).and_raise_error(Puppet::ParseError, /is not a Hash/) }
      it { is_expected.to run.with_params(1).and_raise_error(Puppet::ParseError, /is not a Hash/) }
      it { is_expected.to run.with_params(true).and_raise_error(Puppet::ParseError, /is not a Hash/) }
      it { is_expected.to run.with_params('one').and_raise_error(Puppet::ParseError, /is not a Hash/) }
      it { is_expected.to run.with_params({}, []).and_raise_error(Puppet::ParseError, /is not a Hash/) }
      it { is_expected.to run.with_params({}, 1).and_raise_error(Puppet::ParseError, /is not a Hash/) }
      it { is_expected.to run.with_params({}, true).and_raise_error(Puppet::ParseError, /is not a Hash/) }
      it { is_expected.to run.with_params({}, 'one').and_raise_error(Puppet::ParseError, /is not a Hash/) }
    end
  end
end
