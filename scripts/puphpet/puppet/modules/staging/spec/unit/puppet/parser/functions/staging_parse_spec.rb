#!/usr/bin/env rspec
require 'spec_helper'

describe 'the staging parser function' do
  let(:scope) { PuppetlabsSpec::PuppetInternals.scope }

  it 'exists' do
    Puppet::Parser::Functions.function('staging_parse').should == 'function_staging_parse'
  end

  it 'raises a ParseError if there is less than 1 arguments' do
    -> { scope.function_staging_parse([]) }.should(raise_error(Puppet::ParseError))
  end

  it 'raises a ParseError if there is more than 3 arguments' do
    -> { scope.function_staging_parse(['/etc', 'filename', '.zip', 'error']) }.should(raise_error(Puppet::ParseError))
  end

  it 'raises a ParseError if there is an invalid info request' do
    -> { scope.function_staging_parse(['/etc', 'sheep', '.zip']) }.should(raise_error(Puppet::ParseError))
  end

  it "raises a ParseError if 'source' doesn't have a URI path component" do
    -> { scope.function_staging_parse(['uri:without-path']) }.should(raise_error(Puppet::ParseError, %r{has no URI 'path' component}))
  end

  it 'returns the filename by default' do
    result = scope.function_staging_parse(['/etc/puppet/sample.tar.gz'])
    result.should(eq('sample.tar.gz'))
  end

  it 'returns the file basename' do
    result = scope.function_staging_parse(['/etc/puppet/sample.tar.gz', 'basename'])
    result.should(eq('sample.tar'))
  end

  it 'returns the file basename with custom extensions' do
    result = scope.function_staging_parse(['/etc/puppet/sample.tar.gz', 'basename', '.tar.gz'])
    result.should(eq('sample'))
  end

  it 'returns the file extname' do
    result = scope.function_staging_parse(['/etc/puppet/sample.tar.gz', 'extname'])
    result.should(eq('.gz'))
  end

  it 'returns the file parent' do
    result = scope.function_staging_parse(['/etc/puppet/sample.tar.gz', 'parent'])
    result.should(eq('/etc/puppet'))
  end
end
