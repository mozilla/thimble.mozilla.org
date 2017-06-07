require 'spec_helper'

describe 'validate_re' do
  describe 'signature validation' do
    it { is_expected.not_to eq(nil) }
    it { is_expected.to run.with_params().and_raise_error(Puppet::ParseError, /wrong number of arguments/i) }
    it { is_expected.to run.with_params('').and_raise_error(Puppet::ParseError, /wrong number of arguments/i) }
    it { is_expected.to run.with_params('', '', '', 'extra').and_raise_error(Puppet::ParseError, /wrong number of arguments/i) }

    describe 'valid inputs' do
      it { is_expected.to run.with_params('', '') }
      it { is_expected.to run.with_params('', ['']) }
      it { is_expected.to run.with_params('', [''], 'custom error') }
      it { is_expected.to run.with_params('one', '^one') }
      it { is_expected.to run.with_params('one', [ '^one', '^two' ]) }
      it { is_expected.to run.with_params('one', [ '^one', '^two' ], 'custom error') }
    end

    describe 'invalid inputs' do
      it {
        pending('should implement stricter type checking')
        is_expected.to run.with_params([], '').and_raise_error(Puppet::ParseError, /is not a String/)
      }
      it {
        pending('should implement stricter type checking')
        is_expected.to run.with_params('', {}).and_raise_error(Puppet::ParseError, /is not an Array/)
      }
      it {
        pending('should implement stricter type checking')
        is_expected.to run.with_params('', '', []).and_raise_error(Puppet::ParseError, /is not a String/)
      }
      it {
        pending('should implement stricter type checking')
        is_expected.to run.with_params(nil, nil).and_raise_error(Puppet::ParseError, /is not a String/)
      }
      it { is_expected.to run.with_params('', []).and_raise_error(Puppet::ParseError, /does not match/) }
      it { is_expected.to run.with_params('one', 'two').and_raise_error(Puppet::ParseError, /does not match/) }
      it { is_expected.to run.with_params('', 'two').and_raise_error(Puppet::ParseError, /does not match/) }
      it { is_expected.to run.with_params('', ['two']).and_raise_error(Puppet::ParseError, /does not match/) }
      it { is_expected.to run.with_params('', ['two'], 'custom error').and_raise_error(Puppet::ParseError, /custom error/) }
      it { is_expected.to run.with_params('notone', '^one').and_raise_error(Puppet::ParseError, /does not match/) }
      it { is_expected.to run.with_params('notone', [ '^one', '^two' ]).and_raise_error(Puppet::ParseError, /does not match/) }
      it { is_expected.to run.with_params('notone', [ '^one', '^two' ], 'custom error').and_raise_error(Puppet::ParseError, /custom error/) }

      describe 'non-string inputs' do
        [
          1,             # Fixnum
          3.14,          # Float
          nil,           # NilClass
          true,          # TrueClass
          false,         # FalseClass
          ["10"],        # Array
          :key,          # Symbol
          {:key=>"val"}, # Hash
        ].each do |input|
          it { is_expected.to run.with_params(input, '.*').and_raise_error(Puppet::ParseError, /needs to be a String/) }
        end
      end
    end
  end
end
