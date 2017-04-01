require 'spec_helper'

describe 'validate_ip_address' do
  describe 'signature validation' do
    it { is_expected.not_to eq(nil) }
    it { is_expected.to run.with_params().and_raise_error(Puppet::ParseError, /wrong number of arguments/i) }
  end

  describe 'valid inputs' do
    it { is_expected.to run.with_params('0.0.0.0') }
    it { is_expected.to run.with_params('8.8.8.8') }
    it { is_expected.to run.with_params('127.0.0.1') }
    it { is_expected.to run.with_params('10.10.10.10') }
    it { is_expected.to run.with_params('194.232.104.150') }
    it { is_expected.to run.with_params('244.24.24.24') }
    it { is_expected.to run.with_params('255.255.255.255') }
    it { is_expected.to run.with_params('1.2.3.4', '5.6.7.8') }
    it { is_expected.to run.with_params('3ffe:0505:0002::') }
    it { is_expected.to run.with_params('3ffe:0505:0002::', '3ffe:0505:0002::2') }
    it { is_expected.to run.with_params('::1/64') }
    it { is_expected.to run.with_params('fe80::a00:27ff:fe94:44d6/64') }
    context 'with netmasks' do
      it { is_expected.to run.with_params('8.8.8.8/0') }
      it { is_expected.to run.with_params('8.8.8.8/16') }
      it { is_expected.to run.with_params('8.8.8.8/32') }
      it { is_expected.to run.with_params('8.8.8.8/255.255.0.0') }
    end
  end

  describe 'invalid inputs' do
    it { is_expected.to run.with_params({}).and_raise_error(Puppet::ParseError, /is not a string/) }
    it { is_expected.to run.with_params(1).and_raise_error(Puppet::ParseError, /is not a string/) }
    it { is_expected.to run.with_params(true).and_raise_error(Puppet::ParseError, /is not a string/) }
    it { is_expected.to run.with_params('one').and_raise_error(Puppet::ParseError, /is not a valid IP/) }
    it { is_expected.to run.with_params('0.0.0').and_raise_error(Puppet::ParseError, /is not a valid IP/) }
    it { is_expected.to run.with_params('0.0.0.256').and_raise_error(Puppet::ParseError, /is not a valid IP/) }
    it { is_expected.to run.with_params('0.0.0.0.0').and_raise_error(Puppet::ParseError, /is not a valid IP/) }
    it { is_expected.to run.with_params('1.2.3.4', {}).and_raise_error(Puppet::ParseError, /is not a string/) }
    it { is_expected.to run.with_params('1.2.3.4', 1).and_raise_error(Puppet::ParseError, /is not a string/) }
    it { is_expected.to run.with_params('1.2.3.4', true).and_raise_error(Puppet::ParseError, /is not a string/) }
    it { is_expected.to run.with_params('1.2.3.4', 'one').and_raise_error(Puppet::ParseError, /is not a valid IP/) }
    it { is_expected.to run.with_params('::1', {}).and_raise_error(Puppet::ParseError, /is not a string/) }
    it { is_expected.to run.with_params('::1', true).and_raise_error(Puppet::ParseError, /is not a string/) }
    it { is_expected.to run.with_params('::1', 'one').and_raise_error(Puppet::ParseError, /is not a valid IP/) }
  end
end
