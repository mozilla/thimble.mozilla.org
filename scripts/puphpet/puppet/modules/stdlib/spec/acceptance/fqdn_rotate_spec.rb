#! /usr/bin/env ruby -S rspec
require 'spec_helper_acceptance'

describe 'fqdn_rotate function', :unless => UNSUPPORTED_PLATFORMS.include?(fact('operatingsystem')) do
  describe 'success' do
    include_context "with faked facts"
    context "when the FQDN is 'fakehost.localdomain'" do
      before :each do
        fake_fact("fqdn", "fakehost.localdomain")
      end

      it 'rotates arrays' do
        pp = <<-EOS
        $a = ['a','b','c','d']
        $o = fqdn_rotate($a)
        notice(inline_template('fqdn_rotate is <%= @o.inspect %>'))
        EOS

        apply_manifest(pp, :catch_failures => true) do |r|
          expect(r.stdout).to match(/fqdn_rotate is \["d", "a", "b", "c"\]/)
        end
      end
      it 'rotates arrays with custom seeds' do
        pp = <<-EOS
        $a = ['a','b','c','d']
        $s = 'seed'
        $o = fqdn_rotate($a, $s)
        notice(inline_template('fqdn_rotate is <%= @o.inspect %>'))
        EOS

        apply_manifest(pp, :catch_failures => true) do |r|
          expect(r.stdout).to match(/fqdn_rotate is \["c", "d", "a", "b"\]/)
        end
      end
      it 'rotates strings' do
        pp = <<-EOS
        $a = 'abcd'
        $o = fqdn_rotate($a)
        notice(inline_template('fqdn_rotate is <%= @o.inspect %>'))
        EOS

        apply_manifest(pp, :catch_failures => true) do |r|
          expect(r.stdout).to match(/fqdn_rotate is "dabc"/)
        end
      end
      it 'rotates strings with custom seeds' do
        pp = <<-EOS
        $a = 'abcd'
        $s = 'seed'
        $o = fqdn_rotate($a, $s)
        notice(inline_template('fqdn_rotate is <%= @o.inspect %>'))
        EOS

        apply_manifest(pp, :catch_failures => true) do |r|
          expect(r.stdout).to match(/fqdn_rotate is "cdab"/)
        end
      end
    end
  end
  describe 'failure' do
    it 'handles improper argument counts'
    it 'handles invalid arguments'
  end
end
