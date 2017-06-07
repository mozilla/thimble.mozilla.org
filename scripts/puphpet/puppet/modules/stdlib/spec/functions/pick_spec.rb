require 'spec_helper'

describe 'pick' do
  it { is_expected.not_to eq(nil) }
  it { is_expected.to run.with_params().and_raise_error(Puppet::ParseError, /must receive at least one non empty value/) }
  it { is_expected.to run.with_params('', nil, :undef, :undefined).and_raise_error(Puppet::ParseError, /must receive at least one non empty value/) }
  it { is_expected.to run.with_params('one', 'two').and_return('one') }
  it { is_expected.to run.with_params('', 'two').and_return('two') }
  it { is_expected.to run.with_params(:undef, 'two').and_return('two') }
  it { is_expected.to run.with_params(:undefined, 'two').and_return('two') }
  it { is_expected.to run.with_params(nil, 'two').and_return('two') }
end
