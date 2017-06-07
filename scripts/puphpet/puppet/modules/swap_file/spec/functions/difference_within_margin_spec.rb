require 'spec_helper'

describe 'difference_within_margin' do
  it { is_expected.not_to eq(nil) }
  it { is_expected.to run.with_params([]).and_raise_error(Puppet::ParseError, /Wrong number of arguments given \(1 for 2\)/i) }
  it { is_expected.to run.with_params(['1','2']).and_raise_error(Puppet::ParseError, /Wrong number of arguments given \(1 for 2\)/i) }
  it { is_expected.to run.with_params([],'2').and_raise_error(Puppet::ParseError, /arg\[0\] array cannot be empty/i) }

  it { is_expected.to run.with_params([100,150],60).and_return(true) }
  it { is_expected.to run.with_params([100,150],40).and_return(false) }
  it { is_expected.to run.with_params([213909504, 209711104], 5242880).and_return(true) }
  it { is_expected.to run.with_params([104853504,209715200],5242880).and_return(false) }

  it { is_expected.to run.with_params(['100','150'],'60').and_return(true) }
  it { is_expected.to run.with_params(['100','150'],'40').and_return(false) }
  it { is_expected.to run.with_params(['213909504','209711104'],'5242880').and_return(true) }
  it { is_expected.to run.with_params(['104853504','209715200'],'5242880').and_return(false) }


end
