require 'spec_helper'

describe 'elasticsearch::script', :type => 'define' do

  let :facts do {
    :operatingsystem => 'CentOS',
    :kernel => 'Linux',
    :osfamily => 'RedHat',
    :operatingsystemmajrelease => '6',
    :scenario => '',
    :common => ''
  } end

  let(:title) { 'foo' }
  let(:pre_condition) { 'class {"elasticsearch": config => { "node" => {"name" => "test" }}}'}

  context "Add a script" do

    let :params do {
      :ensure => 'present',
      :source   => 'puppet:///path/to/foo.groovy',
    } end

    it { should contain_elasticsearch__script('foo') }
    it { should contain_file('/usr/share/elasticsearch/scripts/foo.groovy').with(:source => 'puppet:///path/to/foo.groovy', :ensure => 'present') }
  end

  context "Delete a script" do

    let :params do {
      :ensure => 'absent',
      :source => 'puppet:///path/to/foo.groovy',
    } end

    it { should contain_elasticsearch__script('foo') }
    it { should contain_file('/usr/share/elasticsearch/scripts/foo.groovy').with(:source => 'puppet:///path/to/foo.groovy', :ensure => 'absent') }
  end

end
