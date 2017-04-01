require 'spec_helper'

describe 'chomp' do
  it { is_expected.not_to eq(nil) }
  it { is_expected.to run.with_params().and_raise_error(Puppet::ParseError) }
  it { is_expected.to run.with_params(1).and_raise_error(Puppet::ParseError) }
  it {
    pending("Current implementation ignores parameters after the first.")
    is_expected.to run.with_params("a", "b").and_raise_error(Puppet::ParseError)
  }
  it { is_expected.to run.with_params("one").and_return("one") }
  it { is_expected.to run.with_params("one\n").and_return("one") }
  it { is_expected.to run.with_params("one\n\n").and_return("one\n") }
  it { is_expected.to run.with_params(["one\n", "two", "three\n"]).and_return(["one", "two", "three"]) }

  it { is_expected.to run.with_params(AlsoString.new("one")).and_return("one") }
  it { is_expected.to run.with_params(AlsoString.new("one\n")).and_return("one") }
  it { is_expected.to run.with_params(AlsoString.new("one\n\n")).and_return("one\n") }
  it { is_expected.to run.with_params([AlsoString.new("one\n"), AlsoString.new("two"), "three\n"]).and_return(["one", "two", "three"]) }
end
