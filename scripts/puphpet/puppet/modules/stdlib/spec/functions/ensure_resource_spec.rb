require 'spec_helper'

describe 'ensure_resource' do
  it { is_expected.not_to eq(nil) }
  it { is_expected.to run.with_params().and_raise_error(ArgumentError, /Must specify a type/) }
  it { is_expected.to run.with_params('type').and_raise_error(ArgumentError, /Must specify a title/) }
  it { is_expected.to run.with_params('type', 'title', {}, 'extras').and_raise_error(Puppet::ParseError) }
  it {
    pending("should not accept numbers as arguments")
    is_expected.to run.with_params(1,2,3).and_raise_error(Puppet::ParseError)
  }

  context 'given a catalog with "user { username1: ensure => present }"' do
    let(:pre_condition) { 'user { username1: ensure => present }' }

    describe 'after running ensure_resource("user", "username1", {})' do
      before { subject.call(['User', 'username1', {}]) }

      # this lambda is required due to strangeness within rspec-puppet's expectation handling
      it { expect(lambda { catalogue }).to contain_user('username1').with_ensure('present') }
    end

    describe 'after running ensure_resource("user", "username2", {})' do
      before { subject.call(['User', 'username2', {}]) }

      # this lambda is required due to strangeness within rspec-puppet's expectation handling
      it { expect(lambda { catalogue }).to contain_user('username1').with_ensure('present') }
      it { expect(lambda { catalogue }).to contain_user('username2').without_ensure }
    end

    describe 'after running ensure_resource("user", ["username1", "username2"], {})' do
      before { subject.call(['User', ['username1', 'username2'], {}]) }

      # this lambda is required due to strangeness within rspec-puppet's expectation handling
      it { expect(lambda { catalogue }).to contain_user('username1').with_ensure('present') }
      it { expect(lambda { catalogue }).to contain_user('username2').without_ensure }
    end

    describe 'when providing already set params' do
      let(:params) { { 'ensure' => 'present' } }
      before { subject.call(['User', ['username2', 'username3'], params]) }

      # this lambda is required due to strangeness within rspec-puppet's expectation handling
      it { expect(lambda { catalogue }).to contain_user('username1').with(params) }
      it { expect(lambda { catalogue }).to contain_user('username2').with(params) }
    end

    context 'when trying to add params' do
      it { is_expected.to run \
        .with_params('User', 'username1', { 'ensure' => 'present', 'shell' => true }) \
        .and_raise_error(Puppet::Resource::Catalog::DuplicateResourceError, /User\[username1\] is already declared/)
      }
    end
  end
end
