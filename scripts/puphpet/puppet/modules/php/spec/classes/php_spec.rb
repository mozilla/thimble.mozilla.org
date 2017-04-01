require "#{File.join(File.dirname(__FILE__),'..','spec_helper.rb')}"

describe 'php' do

  let(:title) { 'php' }
  let(:node) { 'rspec.example42.com' }
  let(:facts) { { :ipaddress => '10.42.42.42' } }

  describe 'Test standard installation' do
    it { should contain_package('php').with_ensure('present') }
    it { should contain_file('php.conf').with_ensure('present') }
  end

  describe 'Test installation of a specific version' do
    let(:params) { {:version => '1.0.42' } }
    it { should contain_package('php').with_ensure('1.0.42') }
  end

  describe 'Test decommissioning - absent' do
    let(:params) { {:absent => true, :monitor => true } }

    it 'should remove Package[php]' do should contain_package('php').with_ensure('absent') end 
    it 'should remove php configuration file' do should contain_file('php.conf').with_ensure('absent') end
  end

  describe 'Test customizations - template' do
    let(:params) { {:template => "php/spec.erb" , :options => { 'opt_a' => 'value_a' } } }
    it { should contain_file('php.conf').with_content(/fqdn: rspec.example42.com/) }
    it { should contain_file('php.conf').with_content(/value_a/) }
  end

  describe 'Test customizations - source' do
    let(:params) { {:source => "puppet://modules/php/spec" , :source_dir => "puppet://modules/php/dir/spec" , :source_dir_purge => true } }
    it { should contain_file('php.conf').with_source('puppet://modules/php/spec') }
    it { should contain_file('php.dir').with_source('puppet://modules/php/dir/spec') }
    it { should contain_file('php.dir').with_purge('true') }
  end

  describe 'Test customizations - custom class' do
    let(:params) { {:my_class => "php::spec" } }
    it { should contain_file('php.conf').with_content(/fqdn: rspec.example42.com/) }
  end

  describe 'Test Puppi Integration' do
    let(:params) { {:puppi => true, :puppi_helper => "myhelper"} }

    it { should contain_puppi__ze('php').with_helper('myhelper') }
  end


end

