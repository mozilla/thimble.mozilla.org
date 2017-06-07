require 'spec_helper'

describe 'is_float' do
  it { is_expected.not_to eq(nil) }
  it { is_expected.to run.with_params().and_raise_error(Puppet::ParseError, /wrong number of arguments/i) }
  it { is_expected.to run.with_params(0.1, 0.2).and_raise_error(Puppet::ParseError, /wrong number of arguments/i) }

  describe 'passing a string' do
    it { is_expected.to run.with_params('0.1').and_return(true) }
    it { is_expected.to run.with_params('1.0').and_return(true) }
    it { is_expected.to run.with_params('1').and_return(false) }
    it { is_expected.to run.with_params('one').and_return(false) }
    it { is_expected.to run.with_params('one 1.0').and_return(false) }
    it { is_expected.to run.with_params('1.0 one').and_return(false) }
  end

  describe 'passing numbers' do
    it { is_expected.to run.with_params(0.1).and_return(true) }
    it { is_expected.to run.with_params(1.0).and_return(true) }
    it { is_expected.to run.with_params(1).and_return(false) }
  end
end
