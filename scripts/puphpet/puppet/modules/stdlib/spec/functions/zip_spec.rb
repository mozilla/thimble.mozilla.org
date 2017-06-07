require 'spec_helper'

describe 'zip' do
  it { is_expected.not_to eq(nil) }
  it { is_expected.to run.with_params().and_raise_error(Puppet::ParseError, /wrong number of arguments/i) }
  it { is_expected.to run.with_params([]).and_raise_error(Puppet::ParseError, /wrong number of arguments/i) }
  it {
    pending("Current implementation ignores parameters after the third.")
    is_expected.to run.with_params([], [], true, []).and_raise_error(Puppet::ParseError, /wrong number of arguments/i)
  }
  it { is_expected.to run.with_params([], []).and_return([]) }
  it { is_expected.to run.with_params([1,2,3], [4,5,6]).and_return([[1,4], [2,5], [3,6]]) }
  it { is_expected.to run.with_params([1,2,3], [4,5,6], false).and_return([[1,4], [2,5], [3,6]]) }
  it { is_expected.to run.with_params([1,2,3], [4,5,6], true).and_return([1, 4, 2, 5, 3, 6]) }
end
