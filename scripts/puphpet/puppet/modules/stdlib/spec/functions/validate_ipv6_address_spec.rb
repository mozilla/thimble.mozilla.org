require 'spec_helper'

describe 'validate_ipv6_address' do
  describe 'signature validation' do
    it { is_expected.not_to eq(nil) }
    it { is_expected.to run.with_params().and_raise_error(Puppet::ParseError, /wrong number of arguments/i) }

    describe 'valid inputs' do
      it { is_expected.to run.with_params('3ffe:0505:0002::') }
      it { is_expected.to run.with_params('3ffe:0505:0002::', '3ffe:0505:0002::2') }
      it { is_expected.to run.with_params('::1/64') }
      it { is_expected.to run.with_params('fe80::a00:27ff:fe94:44d6/64') }
    end

    describe 'invalid inputs' do
      it { is_expected.to run.with_params({}).and_raise_error(Puppet::ParseError, /is not a string/) }
      it { is_expected.to run.with_params(true).and_raise_error(Puppet::ParseError, /is not a string/) }
      it { is_expected.to run.with_params('one').and_raise_error(Puppet::ParseError, /is not a valid IPv6/) }
      it { is_expected.to run.with_params('0.0.0').and_raise_error(Puppet::ParseError, /is not a valid IPv6/) }
      it { is_expected.to run.with_params('0.0.0.256').and_raise_error(Puppet::ParseError, /is not a valid IPv6/) }
      it { is_expected.to run.with_params('0.0.0.0.0').and_raise_error(Puppet::ParseError, /is not a valid IPv6/) }
      it { is_expected.to run.with_params('affe:beef').and_raise_error(Puppet::ParseError, /is not a valid IPv6/) }
      it { is_expected.to run.with_params('::1', {}).and_raise_error(Puppet::ParseError, /is not a string/) }
      it { is_expected.to run.with_params('::1', true).and_raise_error(Puppet::ParseError, /is not a string/) }
      it { is_expected.to run.with_params('::1', 'one').and_raise_error(Puppet::ParseError, /is not a valid IPv6/) }
      context 'unless running on ruby 1.8.7', :if => RUBY_VERSION != '1.8.7' do
        it { is_expected.to run.with_params(1).and_raise_error(Puppet::ParseError, /is not a string/) }
        it { is_expected.to run.with_params('::1', 1).and_raise_error(Puppet::ParseError, /is not a string/) }
      end
    end
  end
end
