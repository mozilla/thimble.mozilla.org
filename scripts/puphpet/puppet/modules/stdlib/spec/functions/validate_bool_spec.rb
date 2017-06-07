require 'spec_helper'

describe 'validate_bool' do
  describe 'signature validation' do
    it { is_expected.not_to eq(nil) }
    it { is_expected.to run.with_params().and_raise_error(Puppet::ParseError, /wrong number of arguments/i) }
  end

  describe 'acceptable values' do
    it { is_expected.to run.with_params(true) }
    it { is_expected.to run.with_params(false) }
    it { is_expected.to run.with_params(true, false, false, true) }
  end

  describe 'validation failures' do
    it { is_expected.to run.with_params('one').and_raise_error(Puppet::ParseError, /is not a boolean/) }
    it { is_expected.to run.with_params(true, 'one').and_raise_error(Puppet::ParseError, /is not a boolean/) }
    it { is_expected.to run.with_params('one', false).and_raise_error(Puppet::ParseError, /is not a boolean/) }
    it { is_expected.to run.with_params("true").and_raise_error(Puppet::ParseError, /is not a boolean/) }
    it { is_expected.to run.with_params("false").and_raise_error(Puppet::ParseError, /is not a boolean/) }
    it { is_expected.to run.with_params(true, "false").and_raise_error(Puppet::ParseError, /is not a boolean/) }
    it { is_expected.to run.with_params("true", false).and_raise_error(Puppet::ParseError, /is not a boolean/) }
    it { is_expected.to run.with_params("true", false, false, false, false, false).and_raise_error(Puppet::ParseError, /is not a boolean/) }
  end
end
