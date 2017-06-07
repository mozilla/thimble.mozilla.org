require 'spec_helper'

describe 'deep_implode' do

  describe 'exception handling' do
    it { is_expected.to run.with_params().and_raise_error(
      Puppet::ParseError, /wrong number of arguments/i
    ) }

    it { is_expected.to run.with_params({}, {}).and_raise_error(
      Puppet::ParseError, /wrong number of arguments/i
    ) }

    it { is_expected.to run.with_params('2').and_raise_error(
      Puppet::ParseError, /unexpected argument type/
    ) }
  end

  ['value', ['value'], 0, 10].each do |value|
    describe "qualifying #{value}" do
      it { is_expected.to run.with_params({}).and_return({}) }

      it { is_expected.to run.with_params({
        'key' => value
      }).and_return({
        'key' => value
      }) }

      it { is_expected.to run.with_params({
        'key' => { 'subkey' => value }
      }).and_return({
        'key.subkey' => value
      }) }

      it { is_expected.to run.with_params({
        'key' => { 'subkey' => {'subsubkey' => { 'bottom' => value } } }
      }).and_return({
        'key.subkey.subsubkey.bottom' => value
      }) }
    end
  end

  # The preferred behavior is to favor fully-qualified keys
  describe 'key collisions' do
    it { is_expected.to run.with_params({
      'key1' => {
        'subkey1' => 'value1'
      },
      'key1.subkey1' => 'value2'
    }).and_return({
      'key1.subkey1' => 'value2'
    }) }

    it { is_expected.to run.with_params({
      'key1.subkey1' => 'value2',
      'key1' => {
        'subkey1' => 'value1'
      }
    }).and_return({
      'key1.subkey1' => 'value2'
    }) }
  end

  describe 'deep merging' do
    it { is_expected.to run.with_params({
      'key1' => {
        'subkey1' => ['value1']
      },
      'key1.subkey1' => ['value2']
    }).and_return({
      'key1.subkey1' => ['value2', 'value1']
    }) }

    it { is_expected.to run.with_params({
      'key1' => {
        'subkey1' => {'key2' => 'value1'}
      },
      'key1.subkey1' => {'key3' => 'value2'}
    }).and_return({
      'key1.subkey1.key2' => 'value1',
      'key1.subkey1.key3' => 'value2'
    }) }

    it { is_expected.to run.with_params({
      'key1' => {
        'subkey1' => {'key2' => ['value1']}
      },
      'key1.subkey1' => {'key2' => ['value2']}
    }).and_return({
      'key1.subkey1.key2' => ['value2', 'value1']
    }) }

    it { is_expected.to run.with_params({
      'key1' => {
        'subkey1' => {'key2' => 'value1'},
        'subkey1.key2' => 'value2'
      }
    }).and_return({
      'key1.subkey1.key2' => 'value2'
    }) }
  end

  it 'should not change the original hashes' do
    argument1 = { 'key1' => 'value1' }
    original1 = argument1.dup

    subject.call([argument1])
    expect(argument1).to eq(original1)
  end

end
