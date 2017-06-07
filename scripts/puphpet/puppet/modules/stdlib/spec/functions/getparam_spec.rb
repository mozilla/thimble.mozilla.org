require 'spec_helper'

describe 'getparam' do
  it { is_expected.not_to eq(nil) }
  it { is_expected.to run.with_params().and_raise_error(ArgumentError, /Must specify a reference/) }
  it { is_expected.to run.with_params('User[one]').and_raise_error(ArgumentError, /Must specify name of a parameter/) }
  it { is_expected.to run.with_params('User[one]', 2).and_raise_error(ArgumentError, /Must specify name of a parameter/) }
  it { is_expected.to run.with_params('User[one]', []).and_raise_error(ArgumentError, /Must specify name of a parameter/) }
  it { is_expected.to run.with_params('User[one]', {}).and_raise_error(ArgumentError, /Must specify name of a parameter/) }

  describe 'when compared against a user resource with no params' do
    let(:pre_condition) { 'user { "one": }' }

    it { is_expected.to run.with_params('User[one]', 'ensure').and_return('') }
    it { is_expected.to run.with_params('User[two]', 'ensure').and_return('') }
    it { is_expected.to run.with_params('User[one]', 'shell').and_return('') }
  end

  describe 'when compared against a user resource with params' do
    let(:pre_condition) { 'user { "one": ensure => present, shell => "/bin/sh", managehome => false, }' }

    it { is_expected.to run.with_params('User[one]', 'ensure').and_return('present') }
    it { is_expected.to run.with_params('User[two]', 'ensure').and_return('') }
    it { is_expected.to run.with_params('User[one]', 'shell').and_return('/bin/sh') }
    it {
      pending("both rspec-puppet as well as the function do the wrong thing here.")
      is_expected.to run.with_params('User[one]', 'managehome').and_return(false)
    }
  end
end
