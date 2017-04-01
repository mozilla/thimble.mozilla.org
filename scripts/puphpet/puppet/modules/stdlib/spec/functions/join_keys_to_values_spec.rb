require 'spec_helper'

describe 'join_keys_to_values' do
  it { is_expected.not_to eq(nil) }
  it { is_expected.to run.with_params().and_raise_error(Puppet::ParseError, /Takes exactly two arguments/) }
  it { is_expected.to run.with_params({}, '', '').and_raise_error(Puppet::ParseError, /Takes exactly two arguments/) }
  it { is_expected.to run.with_params('one', '').and_raise_error(TypeError, /The first argument must be a hash/) }
  it { is_expected.to run.with_params({}, 2).and_raise_error(TypeError, /The second argument must be a string/) }

  it { is_expected.to run.with_params({}, '').and_return([]) }
  it { is_expected.to run.with_params({}, ':').and_return([]) }
  it { is_expected.to run.with_params({ 'key' => 'value' }, '').and_return(['keyvalue']) }
  it { is_expected.to run.with_params({ 'key' => 'value' }, ':').and_return(['key:value']) }
  it { is_expected.to run.with_params({ 'key' => nil }, ':').and_return(['key:']) }
  it 'should run join_keys_to_values(<hash with multiple keys>, ":") and return the proper array' do
    result = subject.call([{ 'key1' => 'value1', 'key2' => 'value2' }, ':'])
    expect(result.sort).to eq(['key1:value1', 'key2:value2'].sort)
  end
end
