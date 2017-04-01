require 'spec_helper'

describe 'is_string' do
  it { is_expected.not_to eq(nil) }
  it { is_expected.to run.with_params().and_raise_error(Puppet::ParseError, /wrong number of arguments/i) }
  it {
    pending("Current implementation ignores parameters after the first.")
    is_expected.to run.with_params('', '').and_raise_error(Puppet::ParseError, /wrong number of arguments/i)
  }

  it { is_expected.to run.with_params(3).and_return(false) }
  it { is_expected.to run.with_params('3').and_return(false) }
  it { is_expected.to run.with_params(-3).and_return(false) }
  it { is_expected.to run.with_params('-3').and_return(false) }

  it { is_expected.to run.with_params(3.7).and_return(false) }
  it { is_expected.to run.with_params('3.7').and_return(false) }
  it { is_expected.to run.with_params(-3.7).and_return(false) }
  it { is_expected.to run.with_params('3.7').and_return(false) }

  it { is_expected.to run.with_params([]).and_return(false) }
  it { is_expected.to run.with_params([1]).and_return(false) }
  it { is_expected.to run.with_params({}).and_return(false) }
  it { is_expected.to run.with_params(true).and_return(false) }
  it { is_expected.to run.with_params(false).and_return(false) }
  it { is_expected.to run.with_params('one').and_return(true) }
  it { is_expected.to run.with_params('0001234').and_return(true) }
end
