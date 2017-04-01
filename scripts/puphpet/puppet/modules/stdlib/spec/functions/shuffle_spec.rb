require 'spec_helper'

describe 'shuffle' do
  it { is_expected.not_to eq(nil) }
  it { is_expected.to run.with_params().and_raise_error(Puppet::ParseError, /wrong number of arguments/i) }
  it {
    pending("Current implementation ignores parameters after the first.")
    is_expected.to run.with_params([], 'extra').and_raise_error(Puppet::ParseError, /wrong number of arguments/i)
  }
  it { is_expected.to run.with_params(1).and_raise_error(Puppet::ParseError, /Requires either array or string to work/) }
  it { is_expected.to run.with_params({}).and_raise_error(Puppet::ParseError, /Requires either array or string to work/) }
  it { is_expected.to run.with_params(true).and_raise_error(Puppet::ParseError, /Requires either array or string to work/) }

  context 'when running with a specific seed' do
    # make tests deterministic
    before(:each) { srand(2) }

    it { is_expected.to run.with_params([]).and_return([]) }
    it { is_expected.to run.with_params(['a']).and_return(['a']) }
    it { is_expected.to run.with_params(['one']).and_return(['one']) }
    it { is_expected.to run.with_params(['one', 'two', 'three']).and_return(['two', 'one', 'three']) }
    it { is_expected.to run.with_params(['one', 'two', 'three', 'four']).and_return(['four', 'three', 'two', 'one']) }

    it { is_expected.to run.with_params('').and_return('') }
    it { is_expected.to run.with_params('a').and_return('a') }
    it { is_expected.to run.with_params('abc').and_return('bac') }
    it { is_expected.to run.with_params('abcd').and_return('dcba') }

    context 'when using a class extending String' do
      it { is_expected.to run.with_params(AlsoString.new('asdfghjkl')).and_return('lkhdsfajg') }
    end
  end
end
