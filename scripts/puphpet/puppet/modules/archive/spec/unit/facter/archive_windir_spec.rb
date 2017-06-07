require 'spec_helper'
require 'facter/archive_windir'

describe 'archive_windir fact specs', type: :fact do
  before { Facter.clear }
  after { Facter.clear }

  context 'RedHat' do
    before do
      Facter.fact(:osfamily).stubs(:value).returns 'RedHat'
    end
    it 'is nil on RedHat' do
      expect(Facter.fact(:archive_windir).value).to be_nil
    end
  end

  context 'Windows' do
    before do
      Facter.fact(:osfamily).stubs(:value).returns 'windows'
    end
    it 'defaults to C:\\staging on windows' do
      expect(Facter.fact(:archive_windir).value).to eq('C:\\staging')
    end
  end
end
