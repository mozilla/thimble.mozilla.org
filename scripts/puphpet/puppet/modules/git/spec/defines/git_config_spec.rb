require 'spec_helper'

describe 'git::config', :type => :define do
  context 'has working default parameters' do
    let(:title) { 'user.name' }
    let(:params) {
      {
        :value => 'JC Denton',
      }
    }
    it do
      should contain_git_config('user.name').with(
        'value'   => 'JC Denton',
        'key'     => 'user.name',
        'user'    => 'root'
      )
      have_git_config_resource_count(1)
    end
  end
  context 'allows you to change user' do
    let(:title) { 'user.email' }
    let(:params) {
      {
        :value => 'jcdenton@UNATCO.com',
        :user  => 'admin'
      }
    }
    it do
      should contain_git_config('user.email').with(
        'value'   => 'jcdenton@UNATCO.com',
        'key'     => 'user.email',
        'user'    => 'admin'
      )
      have_git_config_resource_count(1)
    end
  end
end
