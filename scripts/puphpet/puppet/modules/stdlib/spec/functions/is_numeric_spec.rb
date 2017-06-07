require 'spec_helper'

describe 'is_numeric' do
  it { is_expected.not_to eq(nil) }
  it { is_expected.to run.with_params().and_raise_error(Puppet::ParseError, /wrong number of arguments/i) }
  it { is_expected.to run.with_params(1, 2).and_raise_error(Puppet::ParseError, /wrong number of arguments/i) }

  it { is_expected.to run.with_params(3).and_return(true) }
  it { is_expected.to run.with_params('3').and_return(true) }
  it { is_expected.to run.with_params(-3).and_return(true) }
  it { is_expected.to run.with_params('-3').and_return(true) }
  
  it { is_expected.to run.with_params(3.7).and_return(true) }
  it { is_expected.to run.with_params('3.7').and_return(true) }
  it { is_expected.to run.with_params(-3.7).and_return(true) }
  it { is_expected.to run.with_params('3.7').and_return(true) }

  it { is_expected.to run.with_params('-342.2315e-12').and_return(true) }

  it { is_expected.to run.with_params('one').and_return(false) }
  it { is_expected.to run.with_params([]).and_return(false) }
  it { is_expected.to run.with_params([1]).and_return(false) }
  it { is_expected.to run.with_params({}).and_return(false) }
  it { is_expected.to run.with_params(true).and_return(false) }
  it { is_expected.to run.with_params(false).and_return(false) }
  it { is_expected.to run.with_params('0001234').and_return(false) }
  it { is_expected.to run.with_params(' - 1234').and_return(false) }
end
