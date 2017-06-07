require 'spec_helper'

if ENV["FUTURE_PARSER"] == 'yes'
  describe 'type_of' do
    pending 'teach rspec-puppet to load future-only functions under 3.7.5' do
      it { is_expected.not_to eq(nil) }
    end
  end
end

if Puppet.version.to_f >= 4.0
  describe 'is_a' do
    it { is_expected.not_to eq(nil) }
    it { is_expected.to run.with_params().and_raise_error(ArgumentError) }
    it { is_expected.to run.with_params('', '').and_raise_error(ArgumentError) }

    it 'succeeds when comparing a string and a string' do
      is_expected.to run.with_params('hello world', String).and_return(true)
    end

    it 'fails when comparing an integer and a string' do
      is_expected.to run.with_params(5, String).and_return(false)
    end
  end
end
