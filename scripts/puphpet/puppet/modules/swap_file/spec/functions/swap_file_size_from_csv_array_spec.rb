require 'spec_helper'

describe 'swap_file_size_from_csv' do
  it { is_expected.not_to eq(nil) }
  it { is_expected.to run.with_params([]).and_raise_error(Puppet::ParseError, /Wrong number of arguments given \(1 for 2\)/i) }
  it { is_expected.to run.with_params(['1','2']).and_raise_error(Puppet::ParseError, /Wrong number of arguments given \(1 for 2\)/i) }
  it { is_expected.to run.with_params([],'2').and_raise_error(Puppet::ParseError, /swapfile name but be a string/i) }

  it { is_expected.to run.with_params('/mnt/swap.1','/mnt/swap.1||1019900,/mnt/swap.1||1019900').and_return('1019900') }
  it { is_expected.to run.with_params('/mnt/swap.2','/mnt/swap.1||1019900,/mnt/swap.1||1019900').and_return(false) }

end
