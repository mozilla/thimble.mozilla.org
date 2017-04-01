#! /usr/bin/env ruby

require 'spec_helper'
require 'rspec-puppet'

describe 'create_ini_settings' do
  before :each do
    Puppet::Parser::Functions.autoloader.loadall
    Puppet::Parser::Functions.function(:create_resources)
  end

  describe 'argument handling' do
    it { is_expected.to run.with_params.and_raise_error(Puppet::ParseError, /0 for 1 or 2/) }
    it { is_expected.to run.with_params(1,2,3).and_raise_error(Puppet::ParseError, /3 for 1 or 2/) }
    it { is_expected.to run.with_params('foo').and_raise_error(Puppet::ParseError, /Requires all arguments/) }
    it { is_expected.to run.with_params({},'foo').and_raise_error(Puppet::ParseError, /Requires all arguments/) }

    it { is_expected.to run.with_params({}) }
    it { is_expected.to run.with_params({},{}) }

    it { is_expected.to run.with_params({ 'section' => { 'setting' => 'value' }}).and_raise_error(Puppet::ParseError, /must pass the path parameter/) }
    it { is_expected.to run.with_params({ 1 => 2 }).and_raise_error(Puppet::ParseError, /Section 1 must contain a Hash/) }
  end
end
