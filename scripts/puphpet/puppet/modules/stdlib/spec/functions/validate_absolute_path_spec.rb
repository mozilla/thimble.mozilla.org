require 'spec_helper'

describe 'validate_absolute_path' do
  describe 'signature validation' do
    it { is_expected.not_to eq(nil) }
    it { is_expected.to run.with_params().and_raise_error(Puppet::ParseError, /wrong number of arguments/i) }
  end

  describe "valid paths handling" do
    %w{
      C:/
      C:\\
      C:\\WINDOWS\\System32
      C:/windows/system32
      X:/foo/bar
      X:\\foo\\bar
      \\\\host\\windows
      //host/windows
      /
      /var/tmp
      /var/opt/../lib/puppet
    }.each do |path|
      it { is_expected.to run.with_params(path) }
      it { is_expected.to run.with_params(['/tmp', path]) }
    end
  end

  describe 'invalid path handling' do
    context 'garbage inputs' do
      [
        nil,
        [ nil ],
        [ nil, nil ],
        { 'foo' => 'bar' },
        { },
        '',
      ].each do |path|
        it { is_expected.to run.with_params(path).and_raise_error(Puppet::ParseError, /is not an absolute path/) }
        it { is_expected.to run.with_params([path]).and_raise_error(Puppet::ParseError, /is not an absolute path/) }
        it { is_expected.to run.with_params(['/tmp', path]).and_raise_error(Puppet::ParseError, /is not an absolute path/) }
      end
    end

    context 'relative paths' do
      %w{
        relative1
        .
        ..
        ./foo
        ../foo
        etc/puppetlabs/puppet
        opt/puppet/bin
        relative\\windows
      }.each do |path|
        it { is_expected.to run.with_params(path).and_raise_error(Puppet::ParseError, /is not an absolute path/) }
        it { is_expected.to run.with_params([path]).and_raise_error(Puppet::ParseError, /is not an absolute path/) }
        it { is_expected.to run.with_params(['/tmp', path]).and_raise_error(Puppet::ParseError, /is not an absolute path/) }
      end
    end
  end
end

