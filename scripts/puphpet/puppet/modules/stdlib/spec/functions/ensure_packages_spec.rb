require 'spec_helper'

describe 'ensure_packages' do
  it { is_expected.not_to eq(nil) }
  it { is_expected.to run.with_params().and_raise_error(Puppet::ParseError) }
  it {
    pending("should not accept numbers as arguments")
    is_expected.to run.with_params(1).and_raise_error(Puppet::ParseError)
  }
  it {
    pending("should not accept numbers as arguments")
    is_expected.to run.with_params(["packagename", 1]).and_raise_error(Puppet::ParseError)
  }
  it { is_expected.to run.with_params("packagename") }
  it { is_expected.to run.with_params(["packagename1", "packagename2"]) }

  context 'given a catalog with "package { puppet: ensure => absent }"' do
    let(:pre_condition) { 'package { puppet: ensure => absent }' }

    describe 'after running ensure_package("facter")' do
      before { subject.call(['facter']) }

      # this lambda is required due to strangeness within rspec-puppet's expectation handling
      it { expect(lambda { catalogue }).to contain_package('puppet').with_ensure('absent') }
      it { expect(lambda { catalogue }).to contain_package('facter').with_ensure('present') }
    end

    describe 'after running ensure_package("facter", { "provider" => "gem" })' do
      before { subject.call(['facter', { "provider" => "gem" }]) }

      # this lambda is required due to strangeness within rspec-puppet's expectation handling
      it { expect(lambda { catalogue }).to contain_package('puppet').with_ensure('absent').without_provider() }
      it { expect(lambda { catalogue }).to contain_package('facter').with_ensure('present').with_provider("gem") }
    end
  end
end
