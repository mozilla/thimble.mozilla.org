#! /usr/bin/env ruby
require 'spec_helper'

ini_subsetting = Puppet::Type.type(:ini_subsetting)

describe ini_subsetting do
  [true, false].product([true, false, :md5]).each do |cfg, param|
    describe "when Puppet[:show_diff] is #{cfg} and show_diff => #{param}" do

      before do
        Puppet[:show_diff] = cfg
        @value = described_class.new(:name => 'foo', :value => 'whatever', :show_diff => param).property(:value)
      end

      if (cfg and param == true)
        it "should display diff" do
          expect(@value.change_to_s('not_secret','at_all')).to include('not_secret','at_all')
        end

        it "should tell current value" do
          expect(@value.is_to_s('not_secret_at_all')).to eq('not_secret_at_all')
        end

        it "should tell new value" do
          expect(@value.should_to_s('not_secret_at_all')).to eq('not_secret_at_all')
        end
      elsif (cfg and param == :md5)
        it "should tell correct md5 hash for value" do
          expect(@value.change_to_s('not_secret','at_all')).to include('e9e8db547f8960ef32dbc34029735564','46cd73a9509ba78c39f05faf078a8cbe')
          expect(@value.change_to_s('not_secret','at_all')).not_to include('not_secret')
          expect(@value.change_to_s('not_secret','at_all')).not_to include('at_all')
        end

        it "should tell md5 of current value, but not value itself" do
          expect(@value.is_to_s('not_secret_at_all')).to eq('{md5}218fde79f501b8ab8d212f1059bb857f')
          expect(@value.is_to_s('not_secret_at_all')).not_to include('not_secret_at_all')
        end

        it "should tell md5 of new value, but not value itself" do
          expect(@value.should_to_s('not_secret_at_all')).to eq('{md5}218fde79f501b8ab8d212f1059bb857f')
          expect(@value.should_to_s('not_secret_at_all')).not_to include('not_secret_at_all')
        end
      else
        it "should not tell any actual values" do
          expect(@value.change_to_s('not_secret','at_all')).to include('[redacted sensitive information]')
          expect(@value.change_to_s('not_secret','at_all')).not_to include('not_secret')
          expect(@value.change_to_s('not_secret','at_all')).not_to include('at_all')
        end

        it "should not tell current value" do
          expect(@value.is_to_s('not_secret_at_all')).to eq('[redacted sensitive information]')
          expect(@value.is_to_s('not_secret_at_all')).not_to include('not_secret_at_all')
        end

        it "should not tell new value" do
          expect(@value.should_to_s('not_secret_at_all')).to eq('[redacted sensitive information]')
          expect(@value.should_to_s('not_secret_at_all')).not_to include('not_secret_at_all')
        end
      end
    end
  end
end
