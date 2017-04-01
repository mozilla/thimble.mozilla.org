require 'spec_helper'

describe 'defined_with_params' do
  describe 'when no resource is specified' do
    it { is_expected.to run.with_params().and_raise_error(ArgumentError) }
  end
  describe 'when compared against a resource with no attributes' do
    let :pre_condition do
      'user { "dan": }'
    end
    it { is_expected.to run.with_params('User[dan]', {}).and_return(true) }
    it { is_expected.to run.with_params('User[bob]', {}).and_return(false) }
    it { is_expected.to run.with_params('User[dan]', {'foo' => 'bar'}).and_return(false) }
  end

  describe 'when compared against a resource with attributes' do
    let :pre_condition do
      'user { "dan": ensure => present, shell => "/bin/csh", managehome => false}'
    end
    it { is_expected.to run.with_params('User[dan]', {}).and_return(true) }
    it { is_expected.to run.with_params('User[dan]', '').and_return(true) }
    it { is_expected.to run.with_params('User[dan]', {'ensure' => 'present'}).and_return(true) }
    it { is_expected.to run.with_params('User[dan]', {'ensure' => 'present', 'managehome' => false}).and_return(true) }
    it { is_expected.to run.with_params('User[dan]', {'ensure' => 'absent', 'managehome' => false}).and_return(false) }
  end
end
