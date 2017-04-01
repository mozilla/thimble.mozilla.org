require 'spec_helper'

describe 'flatten' do
  it { is_expected.not_to eq(nil) }
  it { is_expected.to run.with_params().and_raise_error(Puppet::ParseError) }
  it { is_expected.to run.with_params([], []).and_raise_error(Puppet::ParseError) }
  it { is_expected.to run.with_params(1).and_raise_error(Puppet::ParseError) }
  it { is_expected.to run.with_params('one').and_raise_error(Puppet::ParseError) }
  it { is_expected.to run.with_params([]).and_return([]) }
  it { is_expected.to run.with_params(['one']).and_return(['one']) }
  it { is_expected.to run.with_params([['one']]).and_return(['one']) }
  it { is_expected.to run.with_params(["a","b","c","d","e","f","g"]).and_return(["a","b","c","d","e","f","g"]) }
  it { is_expected.to run.with_params([["a","b",["c",["d","e"],"f","g"]]]).and_return(["a","b","c","d","e","f","g"]) }
end
