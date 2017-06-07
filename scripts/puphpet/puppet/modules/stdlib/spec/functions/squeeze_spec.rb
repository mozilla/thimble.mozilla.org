require 'spec_helper'

describe 'squeeze' do
  it { is_expected.not_to eq(nil) }
  it { is_expected.to run.with_params().and_raise_error(Puppet::ParseError, /wrong number of arguments/i) }
  it { is_expected.to run.with_params('', '', '').and_raise_error(Puppet::ParseError, /wrong number of arguments/i) }
  it { is_expected.to run.with_params(1).and_raise_error(NoMethodError) }
  it { is_expected.to run.with_params({}).and_raise_error(NoMethodError) }
  it { is_expected.to run.with_params(true).and_raise_error(NoMethodError) }

  context 'when squeezing a single string' do
    it { is_expected.to run.with_params('').and_return('') }
    it { is_expected.to run.with_params('a').and_return('a') }
    it { is_expected.to run.with_params('aaaaaaaaa').and_return('a') }
    it { is_expected.to run.with_params('aaaaaaaaa', 'a').and_return('a') }
    it { is_expected.to run.with_params('aaaaaaaaabbbbbbbbbbcccccccccc', 'b-c').and_return('aaaaaaaaabc') }
  end

  context 'when squeezing values in an array' do
    it {
      is_expected.to run \
        .with_params(['', 'a', 'aaaaaaaaa', 'aaaaaaaaabbbbbbbbbbcccccccccc']) \
        .and_return( ['', 'a', 'a',         'abc'])
    }
    it {
      is_expected.to run \
        .with_params(['', 'a', 'aaaaaaaaa', 'aaaaaaaaabbbbbbbbbbcccccccccc'], 'a') \
        .and_return( ['', 'a', 'a',         'abbbbbbbbbbcccccccccc'])
    }
    it {
      is_expected.to run \
        .with_params(['', 'a', 'aaaaaaaaa', 'aaaaaaaaabbbbbbbbbbcccccccccc'], 'b-c') \
        .and_return( ['', 'a', 'aaaaaaaaa', 'aaaaaaaaabc'])
    }
  end

  context 'when using a class extending String' do
    it 'should call its squeeze method' do
      value = AlsoString.new('aaaaaaaaa')
      value.expects(:squeeze).returns('foo')
      expect(subject).to run.with_params(value).and_return('foo')
    end
  end
end
