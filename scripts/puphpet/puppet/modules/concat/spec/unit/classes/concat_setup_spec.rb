require 'spec_helper'

describe 'concat::setup', :type => :class do

  shared_examples 'setup' do |concatdir|
    concatdir = '/foo' if concatdir.nil?

    let(:facts) do
      {
        :concat_basedir     => concatdir,
        :caller_module_name => 'Test',
        :osfamily           => 'Debian',
        :id                 => 'root',
        :is_pe              => false,
      }
    end

    it do
      should contain_file("#{concatdir}/bin/concatfragments.rb").with({
        :mode   => '0755',
        :owner  => 'root',
        :group  => 0,
        :source => 'puppet:///modules/concat/concatfragments.rb',
      })
    end

    [concatdir, "#{concatdir}/bin"].each do |file|
      it do
        should contain_file(file).with({
          :ensure => 'directory',
          :mode   => '0755',
          :owner  => 'root',
          :group  => 0,
        })
      end
    end
  end

  context 'facts' do
    context 'concat_basedir =>' do
      context '/foo' do
        it_behaves_like 'setup', '/foo'
      end
    end
  end # facts

  context 'deprecated as a public class' do
    it 'should create a warning' do
      skip('rspec-puppet support for testing warning()')
    end
  end

  context "on osfamily Solaris" do
    concatdir = '/foo'
    let(:facts) do
      {
        :concat_basedir     => concatdir,
        :caller_module_name => 'Test',
        :osfamily           => 'Solaris',
        :id                 => 'root',
        :is_pe              => false,
      }
    end

    it do
      should contain_file("#{concatdir}/bin/concatfragments.rb").with({
        :ensure => 'file',
        :owner  => 'root',
        :group  => 0,
        :mode   => '0755',
        :source => 'puppet:///modules/concat/concatfragments.rb',
      })
    end
  end # on osfamily Solaris

  context "on osfamily windows" do
    concatdir = '/foo'
    let(:facts) do
      {
        :concat_basedir     => concatdir,
        :caller_module_name => 'Test',
        :osfamily           => 'windows',
        :id                 => 'batman',
        :is_pe              => false,
      }
    end

    it do
      should contain_file("#{concatdir}/bin/concatfragments.rb").with({
        :ensure => 'file',
        :owner  => nil,
        :group  => nil,
        :mode   => nil,
        :source => 'puppet:///modules/concat/concatfragments.rb',
      })
    end
  end # on osfamily windows
end
