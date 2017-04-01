require 'spec_helper'

describe 'basename' do
  it { is_expected.not_to eq(nil) }
  it { is_expected.to run.with_params().and_raise_error(Puppet::ParseError) }
  it { is_expected.to run.with_params('one', 'two', 'three').and_raise_error(Puppet::ParseError) }
  it { is_expected.to run.with_params([]).and_raise_error(Puppet::ParseError) }
  it { is_expected.to run.with_params('/path/to/a/file.ext', []).and_raise_error(Puppet::ParseError) }
  it { is_expected.to run.with_params('/path/to/a/file.ext').and_return('file.ext') }
  it { is_expected.to run.with_params('relative_path/to/a/file.ext').and_return('file.ext') }
  it { is_expected.to run.with_params('/path/to/a/file.ext', '.ext').and_return('file') }
  it { is_expected.to run.with_params('relative_path/to/a/file.ext', '.ext').and_return('file') }
  it { is_expected.to run.with_params('scheme:///path/to/a/file.ext').and_return('file.ext') }
end
