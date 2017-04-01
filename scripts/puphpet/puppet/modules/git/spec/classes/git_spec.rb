require 'spec_helper'

describe 'git' do

  context 'defaults' do
    it { should contain_package('git') }
  end

  context 'with package_manage set to false' do
    let(:params) {
      {
        :package_manage => false,
      }
    }
    it { should_not contain_package('git') }
  end

  context 'with a custom git package name' do
    let(:params) {
      {
        :package_name => 'gitolite',
      }
    }
    it { should contain_package('gitolite') }
  end

  context 'with package_ensure => latest' do
    let(:params) {
      {
        :package_ensure => 'latest',
      }
    }
    it { should contain_package('git').with(
      {
        'ensure' => 'latest'
      }
    )}
  end

  context 'with configs' do
    let(:params) {
      {
        :configs => {
          "user.name" => {"value" => "test"},
          "user.email" => "test@example.com"
        }
      }
    }
    it { should contain_git__config('user.name') }
    it { should contain_git__config('user.email') }
  end

  context 'with configs and configs defaults' do
    let(:params) {
      {
        :configs => {
          "core.filemode" => false
        },
        :configs_defaults => {
          "scope" => "system"
        }
      }
    }
    it { should contain_git__config('core.filemode').with(
        'value' => false,
        'scope' => 'system'
    ) }
  end

end
