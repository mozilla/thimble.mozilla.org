#!/usr/bin/env ruby

require 'spec_helper'

describe Puppet::Type.type(:swap_file) do

  before do
    @class = described_class
    @provider_class = @class.provide(:fake) { mk_resource_methods }
    @provider = @provider_class.new
    @resource = stub 'resource', :resource => nil, :provider => @provider

    @class.stubs(:defaultprovider).returns @provider_class
    @class.any_instance.stubs(:provider).returns @provider
  end

  it "should have :name as its keyattribute" do
    expect(@class.key_attributes).to eq([:file])
  end

  describe "when validating attributes" do

    params = [
      :file,
    ]

    properties = [
      :type,
      :size,
      :used,
      :priority,
    ]

    params.each do |param|
      it "should have a #{param} parameter" do
        expect(@class.attrtype(param)).to eq(:param)
      end
    end

    properties.each do |prop|
      it "should have a #{prop} property" do
        expect(@class.attrtype(prop)).to eq(:property)
      end
    end

    %w[. ./foo \foo C:/foo \\Server\Foo\Bar \\?\C:\foo\bar \/?/foo\bar \/Server/foo foo//bar/baz].each do |invalid_path|
      context "path => #{invalid_path}" do
        it 'should require a valid path for file' do
          expect {
            @class.new({:file => invalid_path})
          }.to raise_error(Puppet::ResourceError, /file parameter must be a valid absolute path/)
        end
      end
    end

    %w[/ /foo /foo/../bar //foo //Server/Foo/Bar //?/C:/foo/bar /\Server/Foo /foo//bar/baz].each do |valid_path|
      context "path => #{valid_path}" do
        it 'should allow a valid path for file' do
          expect {
            @class.new({:file => valid_path})
          }.not_to raise_error
        end
      end
    end

  end

end
