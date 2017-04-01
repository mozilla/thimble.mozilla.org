require 'spec_helper'

describe Puppet::Type.type(:elasticsearch_shield_user).provider(:parsed) do

  describe 'instances' do
    it 'should have an instance method' do
      expect(described_class).to respond_to :instances
    end

    context 'without users' do
      it 'should return no resources' do
        expect(described_class.parse("\n")).to eq([])
      end
    end

    context 'with one user' do
      it 'should return one resource' do
        expect(described_class.parse(%q{
          elastic:$2a$10$DddrTs0PS3qNknUTq0vpa.g.0JpU.jHDdlKp1xox1W5ZHX.w8Cc8C
        }.gsub(/^\s+/, ''))[0]).to eq({
          :name => 'elastic',
          :hashed_password => '$2a$10$DddrTs0PS3qNknUTq0vpa.g.0JpU.jHDdlKp1xox1W5ZHX.w8Cc8C',
          :record_type => :parsed,
        })
      end
    end

    context 'with multiple users' do
      it 'should return three resources' do
        expect(described_class.parse(%q{

          admin:$2a$10$DddrTs0PS3qNknUTq0vpa.g.0JpU.jHDdlKp1xox1W5ZHX.w8Cc8C
          user:$2a$10$caYr8GhYeJ2Yo0yEhQhQvOjLSwt8Lm6MKQWx8WSnZ/L/IL5sGdQFu
          kibana:$2a$10$daYr8GhYeJ2Yo0yEhQhQvOjLSwt8Lm6MKQWx8WSnZ/L/IL5sGdQFu
        }.gsub(/^\s+/, '')).length).to eq(3)
      end
    end
  end # of describe instances

  describe 'prefetch' do
    it 'should have a prefetch method' do
      expect(described_class).to respond_to :prefetch
    end
  end
end # of describe puppet type
