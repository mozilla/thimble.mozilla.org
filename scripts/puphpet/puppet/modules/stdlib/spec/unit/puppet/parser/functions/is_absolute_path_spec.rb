require 'spec_helper'

describe :is_absolute_path do
  let(:scope) { PuppetlabsSpec::PuppetInternals.scope }

  let(:function_args) do
    []
  end

  let(:function) do
    scope.function_is_absolute_path(function_args)
  end


  describe 'validate arity' do
    let(:function_args) do
       [1,2]
    end
    it "should raise a ParseError if there is more than 1 arguments" do
      lambda { function }.should( raise_error(ArgumentError))
    end

  end
  
  it "should exist" do
    Puppet::Parser::Functions.function(subject).should == "function_#{subject}"
  end

  # help enforce good function defination
  it 'should contain arity' do

  end

  it "should raise a ParseError if there is less than 1 arguments" do
    lambda { function }.should( raise_error(ArgumentError))
  end


  describe 'should retrun true' do
    let(:return_value) do
      true
    end

    describe 'windows' do
      let(:function_args) do
        ['c:\temp\test.txt']
      end
      it 'should return data' do
        function.should eq(return_value)
      end
    end

    describe 'non-windows' do
      let(:function_args) do
        ['/temp/test.txt']
      end

      it 'should return data' do
        function.should eq(return_value)
      end
    end
  end

  describe 'should return false' do
    let(:return_value) do
      false
    end
    describe 'windows' do
      let(:function_args) do
        ['..\temp\test.txt']
      end
      it 'should return data' do
        function.should eq(return_value)
      end
    end

    describe 'non-windows' do
      let(:function_args) do
        ['../var/lib/puppet']
      end
      it 'should return data' do
        function.should eq(return_value)
      end
    end
  end
end