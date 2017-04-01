require 'spec_helper'

describe 'dig' do
  it { is_expected.to run.with_params().and_raise_error(Puppet::ParseError) }
  it { is_expected.to run.with_params('bad', []).and_raise_error(Puppet::ParseError) }
  it { is_expected.to run.with_params({}, 'bad').and_raise_error(Puppet::ParseError) }

  it { is_expected.to run.with_params({}, []).and_return({}) }
  it { is_expected.to run.with_params({"a" => "b"}, ["a"]).and_return("b") }
  it { is_expected.to run.with_params({"a" => {"b" => "c"}}, ["a", "b"]).and_return("c") }
  it { is_expected.to run.with_params({}, ["a", "b"], "d").and_return("d") }
  it { is_expected.to run.with_params({"a" => false}, ["a"]).and_return(false) }
end
