require 'spec_helper'

describe 'es_plugin_name' do

  describe 'exception handling' do
    it { is_expected.to run.with_params().and_raise_error(
      Puppet::ParseError, /wrong number of arguments/i
    ) }
  end

  describe 'single arguments' do
    it { is_expected.to run
      .with_params('foo')
      .and_return('foo') }

    it { is_expected.to run
      .with_params('vendor/foo')
      .and_return('foo') }

    it { is_expected.to run
      .with_params('vendor/foo/1.0.0')
      .and_return('foo') }

    it { is_expected.to run
      .with_params('vendor/es-foo/1.0.0')
      .and_return('foo') }

    it { is_expected.to run
      .with_params('vendor/elasticsearch-foo/1.0.0')
      .and_return('foo') }
  end

  describe 'multiple arguments' do
    it { is_expected.to run
      .with_params('foo', nil)
      .and_return('foo') }

    it { is_expected.to run
      .with_params(nil, 'foo')
      .and_return('foo') }

    it { is_expected.to run
      .with_params(nil, 0, 'foo', 'bar')
      .and_return('foo') }
  end

  describe 'undef parameters' do
    it { is_expected.to run
      .with_params('', 'foo')
      .and_return('foo') }

    it { is_expected.to run
      .with_params('')
      .and_raise_error(Puppet::Error, /could not/) }
  end

  it 'should not change the original values' do
    argument1 = 'foo'
    original1 = argument1.dup

    subject.call([argument1])
    expect(argument1).to eq(original1)
  end

end
