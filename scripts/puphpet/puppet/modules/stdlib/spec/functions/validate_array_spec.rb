require 'spec_helper'

describe 'validate_array' do
  describe 'signature validation' do
    it { is_expected.not_to eq(nil) }
    it { is_expected.to run.with_params().and_raise_error(Puppet::ParseError, /wrong number of arguments/i) }

    describe 'valid inputs' do
      it { is_expected.to run.with_params([]) }
      it { is_expected.to run.with_params(['one']) }
      it { is_expected.to run.with_params([], ['two']) }
      it { is_expected.to run.with_params(['one'], ['two']) }
    end

    describe 'invalid inputs' do
      it { is_expected.to run.with_params({}).and_raise_error(Puppet::ParseError, /is not an Array/) }
      it { is_expected.to run.with_params(1).and_raise_error(Puppet::ParseError, /is not an Array/) }
      it { is_expected.to run.with_params(true).and_raise_error(Puppet::ParseError, /is not an Array/) }
      it { is_expected.to run.with_params('one').and_raise_error(Puppet::ParseError, /is not an Array/) }
      it { is_expected.to run.with_params([], {}).and_raise_error(Puppet::ParseError, /is not an Array/) }
      it { is_expected.to run.with_params([], 1).and_raise_error(Puppet::ParseError, /is not an Array/) }
      it { is_expected.to run.with_params([], true).and_raise_error(Puppet::ParseError, /is not an Array/) }
      it { is_expected.to run.with_params([], 'one').and_raise_error(Puppet::ParseError, /is not an Array/) }
    end
  end
end

