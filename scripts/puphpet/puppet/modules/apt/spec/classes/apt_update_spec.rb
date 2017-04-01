#!/usr/bin/env rspec
require 'spec_helper'

describe 'apt::update', :type => :class do
  context "and apt::update['frequency']='always'" do
    { 'a recent run' => Time.now.to_i, 'we are due for a run' => 1406660561,'the update-success-stamp file does not exist' => -1 }.each_pair do |desc, factval|
      context "and $::apt_update_last_success indicates #{desc}" do
        let(:facts) { { :lsbdistid => 'Debian', :osfamily => 'Debian', :apt_update_last_success => factval, :lsbdistcodename => 'wheezy', :puppetversion   => Puppet.version, } }
        let (:pre_condition) { "class{'::apt': update => {'frequency' => 'always' },}" }
        it 'should trigger an apt-get update run' do
          #set the apt_update exec's refreshonly attribute to false
          is_expected.to contain_exec('apt_update').with({'refreshonly' => false})
        end
      end
    end
    context 'when $::apt_update_last_success is nil' do
      let(:facts) { { :lsbdistid => 'Debian', :osfamily => 'Debian', :lsbdistcodename => 'wheezy', :puppetversion   => Puppet.version, } }
      let (:pre_condition) { "class{ '::apt': update => {'frequency' => 'always' },}" }
      it 'should trigger an apt-get update run' do
        #set the apt_update exec\'s refreshonly attribute to false
        is_expected.to contain_exec('apt_update').with({'refreshonly' => false})
      end
    end
  end
  context "and apt::update['frequency']='reluctantly'" do
    {'a recent run' => Time.now.to_i, 'we are due for a run' => 1406660561,'the update-success-stamp file does not exist' => -1 }.each_pair do |desc, factval|
      context "and $::apt_update_last_success indicates #{desc}" do
        let(:facts) { { :lsbdistid => 'Debian', :osfamily => 'Debian', :apt_update_last_success => factval, :lsbdistcodename => 'wheezy', :puppetversion   => Puppet.version,} }
        let (:pre_condition) { "class{ '::apt': update => {'frequency' => 'reluctantly' },}" }
        it 'should not trigger an apt-get update run' do
          #don't change the apt_update exec's refreshonly attribute. (it should be true)
          is_expected.to contain_exec('apt_update').with({'refreshonly' => true})
        end
      end
    end
    context 'when $::apt_update_last_success is nil' do
      let(:facts) { { :lsbdistid => 'Debian', :osfamily => 'Debian', :lsbdistcodename => 'wheezy', :puppetversion   => Puppet.version, } }
      let (:pre_condition) { "class{ '::apt': update => {'frequency' => 'reluctantly' },}" }
      it 'should not trigger an apt-get update run' do
        #don't change the apt_update exec's refreshonly attribute. (it should be true)
        is_expected.to contain_exec('apt_update').with({'refreshonly' => true})
      end
    end
  end
  ['daily','weekly'].each do |update_frequency|
    context "and apt::update['frequency'] has the value of #{update_frequency}" do
      { 'we are due for a run' => 1406660561,'the update-success-stamp file does not exist' => -1 }.each_pair do |desc, factval|
        context "and $::apt_update_last_success indicates #{desc}" do
          let(:facts) { { :lsbdistid => 'Debian', :osfamily => 'Debian', :apt_update_last_success => factval, :lsbdistcodename => 'wheezy', :puppetversion   => Puppet.version, } }
          let (:pre_condition) { "class{ '::apt': update => {'frequency' => '#{update_frequency}',} }" }
          it 'should trigger an apt-get update run' do
            #set the apt_update exec\'s refreshonly attribute to false
            is_expected.to contain_exec('apt_update').with({'refreshonly' => false})
          end
        end
      end
      context 'when the $::apt_update_last_success fact has a recent value' do
        let(:facts) { { :lsbdistid => 'Debian', :osfamily => 'Debian', :lsbdistcodename => 'wheezy', :apt_update_last_success => Time.now.to_i, :puppetversion   => Puppet.version, } }
        let (:pre_condition) { "class{ '::apt': update => {'frequency' => '#{update_frequency}',} }" }
        it 'should not trigger an apt-get update run' do
          #don't change the apt_update exec\'s refreshonly attribute. (it should be true)
          is_expected.to contain_exec('apt_update').with({'refreshonly' => true})
        end
      end
      context 'when $::apt_update_last_success is nil' do
        let(:facts) { { :lsbdistid => 'Debian', :osfamily => 'Debian', :lsbdistcodename => 'wheezy', :apt_update_last_success => nil, :puppetversion   => Puppet.version, } }
        let (:pre_condition) { "class{ '::apt': update => {'frequency' => '#{update_frequency}',} }" }
        it 'should trigger an apt-get update run' do
          #set the apt_update exec\'s refreshonly attribute to false
          is_expected.to contain_exec('apt_update').with({'refreshonly' => false})
        end
      end
    end
  end
end
