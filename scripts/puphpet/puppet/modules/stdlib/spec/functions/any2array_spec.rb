require 'spec_helper'

describe "any2array" do
  it { is_expected.not_to eq(nil) }
  it { is_expected.to run.with_params().and_return([]) }
  it { is_expected.to run.with_params(true).and_return([true]) }
  it { is_expected.to run.with_params('one').and_return(['one']) }
  it { is_expected.to run.with_params('one', 'two').and_return(['one', 'two']) }
  it { is_expected.to run.with_params([]).and_return([]) }
  it { is_expected.to run.with_params(['one']).and_return(['one']) }
  it { is_expected.to run.with_params(['one', 'two']).and_return(['one', 'two']) }
  it { is_expected.to run.with_params({}).and_return([]) }
  it { is_expected.to run.with_params({ 'key' => 'value' }).and_return(['key', 'value']) }
  it { is_expected.to run.with_params({ 'key' => 'value' }).and_return(['key', 'value']) }
end
