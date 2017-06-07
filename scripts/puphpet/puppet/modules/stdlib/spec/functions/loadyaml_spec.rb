require 'spec_helper'

describe 'loadyaml' do
  it { is_expected.not_to eq(nil) }
  it { is_expected.to run.with_params().and_raise_error(Puppet::ParseError, /wrong number of arguments/i) }
  it { is_expected.to run.with_params('', '').and_raise_error(Puppet::ParseError, /wrong number of arguments/i) }
  context 'when a non-existing file is specified' do
    let(:filename) { '/tmp/doesnotexist' }
    before {
      File.expects(:exists?).with(filename).returns(false).once
      YAML.expects(:load_file).never
    }
    it { is_expected.to run.with_params(filename).and_return(nil) }
  end
  context 'when an existing file is specified' do
    let(:filename) { '/tmp/doesexist' }
    let(:data) { { 'key' => 'value' } }
    before {
      File.expects(:exists?).with(filename).returns(true).once
      YAML.expects(:load_file).with(filename).returns(data).once
    }
    it { is_expected.to run.with_params(filename).and_return(data) }
  end
end
