require 'spec_helper'
require 'puppet'

provider_class = Puppet::Type.type(:ini_subsetting).provider(:ruby)
describe provider_class do
  include PuppetlabsSpec::Files

  let(:tmpfile) { tmpfilename("ini_setting_test") }

  def validate_file(expected_content, tmpfile)
    expect(File.read(tmpfile)).to eq expected_content
  end

  before :each do
    File.open(tmpfile, 'w') do |fh|
      fh.write(orig_content)
    end
  end

  context "when ensuring that a subsetting is present" do
    let(:common_params) { {
        :title    => 'ini_setting_ensure_present_test',
        :path     => tmpfile,
        :section  => '',
        :key_val_separator => '=',
        :setting => 'JAVA_ARGS',
    } }

    let(:orig_content) {
      <<-EOS
JAVA_ARGS="-Xmx192m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/log/pe-puppetdb/puppetdb-oom.hprof"
      EOS
    }

    it "should add a missing subsetting" do
      resource = Puppet::Type::Ini_subsetting.new(common_params.merge(
         :subsetting => '-Xms', :value => '128m'))
      provider = described_class.new(resource)
      expect(provider.exists?).to be_nil
      provider.create
      expected_content = <<-EOS
JAVA_ARGS="-Xmx192m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/log/pe-puppetdb/puppetdb-oom.hprof -Xms128m"
      EOS
      validate_file(expected_content, tmpfile)
    end

    it 'should add a missing subsetting element at the beginning of the line' do
      resource = Puppet::Type::Ini_subsetting.new(common_params.merge(
          :subsetting => '-Xms', :value => '128m', :insert_type => :start))
      provider = described_class.new(resource)
      expect(provider.exists?).to be_nil
      provider.create
      expected_content = <<-EOS
JAVA_ARGS="-Xms128m -Xmx192m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/log/pe-puppetdb/puppetdb-oom.hprof"
      EOS
      validate_file(expected_content, tmpfile)
    end

    it 'should add a missing subsetting element at the end of the line' do
      resource = Puppet::Type::Ini_subsetting.new(common_params.merge(
          :subsetting => '-Xms', :value => '128m', :insert_type => :end))
      provider = described_class.new(resource)
      expect(provider.exists?).to be_nil
      provider.create
      expected_content = <<-EOS
JAVA_ARGS="-Xmx192m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/log/pe-puppetdb/puppetdb-oom.hprof -Xms128m"
      EOS
      validate_file(expected_content, tmpfile)
    end

    it 'should add a missing subsetting element after the given item' do
      resource = Puppet::Type::Ini_subsetting.new(common_params.merge(
          :subsetting => '-Xms', :value => '128m', :insert_type => :after, :insert_value => '-Xmx'))
      provider = described_class.new(resource)
      expect(provider.exists?).to be_nil
      provider.create
      expected_content = <<-EOS
JAVA_ARGS="-Xmx192m -Xms128m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/log/pe-puppetdb/puppetdb-oom.hprof"
      EOS
      validate_file(expected_content, tmpfile)
    end

    it 'should add a missing subsetting element before the given item' do
      resource = Puppet::Type::Ini_subsetting.new(common_params.merge(
          :subsetting => '-Xms', :value => '128m', :insert_type => :before, :insert_value => '-Xmx'))
      provider = described_class.new(resource)
      expect(provider.exists?).to be_nil
      provider.create
      expected_content = <<-EOS
JAVA_ARGS="-Xms128m -Xmx192m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/log/pe-puppetdb/puppetdb-oom.hprof"
      EOS
      validate_file(expected_content, tmpfile)
    end

    it 'should add a missing subsetting element at the given index' do
      resource = Puppet::Type::Ini_subsetting.new(common_params.merge(
          :subsetting => '-Xms', :value => '128m', :insert_type => :index, :insert_value => '1'))
      provider = described_class.new(resource)
      expect(provider.exists?).to be_nil
      provider.create
      expected_content = <<-EOS
JAVA_ARGS="-Xmx192m -Xms128m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/log/pe-puppetdb/puppetdb-oom.hprof"
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should remove an existing subsetting" do
      resource = Puppet::Type::Ini_subsetting.new(common_params.merge(
          :subsetting => '-Xmx'))
      provider = described_class.new(resource)
      expect(provider.exists?).to eq '192m'
      provider.destroy
      expected_content = <<-EOS
JAVA_ARGS="-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/log/pe-puppetdb/puppetdb-oom.hprof"
      EOS
      validate_file(expected_content, tmpfile)
    end

    it 'should be able to remove several subsettings with the same name' do
      resource = Puppet::Type::Ini_subsetting.new(common_params.merge(
          :subsetting => '-XX'))
      provider = described_class.new(resource)
      expect(provider.exists?).to eq ':+HeapDumpOnOutOfMemoryError'
      provider.destroy
      expected_content = <<-EOS
JAVA_ARGS="-Xmx192m"
      EOS
      validate_file(expected_content, tmpfile)
    end
    
    it "should modify an existing subsetting" do
      resource = Puppet::Type::Ini_subsetting.new(common_params.merge(
          :subsetting => '-Xmx', :value => '256m'))
      provider = described_class.new(resource)
      expect(provider.exists?).to eq '192m'
      provider.value=('256m')
      expected_content = <<-EOS
JAVA_ARGS="-Xmx256m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/log/pe-puppetdb/puppetdb-oom.hprof"
      EOS
      validate_file(expected_content, tmpfile)
    end

    it 'should be able to modify several subsettings with the same name' do
      resource = Puppet::Type::Ini_subsetting.new(common_params.merge(
          :subsetting => '-XX', :value => 'test'))
      provider = described_class.new(resource)
      expect(provider.exists?).to eq ':+HeapDumpOnOutOfMemoryError'
      provider.value=('test')
      expected_content = <<-EOS
JAVA_ARGS="-Xmx192m -XXtest -XXtest"
      EOS
      validate_file(expected_content, tmpfile)
    end
  end

  context "when working with subsettings in files with unquoted settings values" do
    let(:common_params) { {
        :title    => 'ini_setting_ensure_present_test',
        :path     => tmpfile,
        :section  => 'master',
        :setting => 'reports',
    } }

    let(:orig_content) {
      <<-EOS
[master]

reports = http,foo
      EOS
    }

    it "should remove an existing subsetting" do
      resource = Puppet::Type::Ini_subsetting.new(common_params.merge(
          :subsetting => 'http', :subsetting_separator => ','))
      provider = described_class.new(resource)
      expect(provider.exists?).to eq ''
      provider.destroy
      expected_content = <<-EOS
[master]

reports = foo
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should add a new subsetting when the 'parent' setting already exists" do
      resource = Puppet::Type::Ini_subsetting.new(common_params.merge(
          :subsetting => 'puppetdb', :subsetting_separator => ','))
      provider = described_class.new(resource)
      expect(provider.exists?).to be_nil
      provider.value=('')
      expected_content = <<-EOS
[master]

reports = http,foo,puppetdb
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should add a new subsetting when the 'parent' setting does not already exist" do
      resource = Puppet::Type::Ini_subsetting.new(common_params.merge(
          :setting => 'somenewsetting',
          :subsetting => 'puppetdb',
          :subsetting_separator => ','))
      provider = described_class.new(resource)
      expect(provider.exists?).to be_nil
      provider.value=('')
      expected_content = <<-EOS
[master]

reports = http,foo
somenewsetting = puppetdb
      EOS
      validate_file(expected_content, tmpfile)
    end

  end

  context "when working with subsettings in files with use_exact_match" do
    let(:common_params) { {
        :title           => 'ini_setting_ensure_present_test',
        :path            => tmpfile,
        :section         => 'master',
        :setting         => 'reports',
        :use_exact_match => true,
    } }

    let(:orig_content) {
      <<-EOS
[master]

reports = http,foo
      EOS
    }

    it "should add a new subsetting when the 'parent' setting already exists" do
      resource = Puppet::Type::Ini_subsetting.new(common_params.merge(
          :subsetting => 'fo', :subsetting_separator => ','))
      provider = described_class.new(resource)
      provider.value=('')
      expected_content = <<-EOS
[master]

reports = http,foo,fo
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should not remove substring subsettings" do
      resource = Puppet::Type::Ini_subsetting.new(common_params.merge(
          :subsetting => 'fo', :subsetting_separator => ','))
      provider = described_class.new(resource)
      provider.value=('')
      provider.destroy
      expected_content = <<-EOS
[master]

reports = http,foo
      EOS
      validate_file(expected_content, tmpfile)
    end
  end

  context 'when working with subsettings in files with subsetting_key_val_separator' do
    let(:common_params) { {
        :title                        => 'ini_setting_ensure_present_test',
        :path                         => tmpfile,
        :section                      => 'master',
        :setting                      => 'reports',
        :subsetting_separator         => ',',
        :subsetting_key_val_separator => ':',
    } }

    let(:orig_content) {
      <<-EOS
[master]

reports = a:1,b:2
      EOS
    }

    it "should add a new subsetting when the 'parent' setting already exists" do
      resource = Puppet::Type::Ini_subsetting.new(common_params.merge(
          :subsetting => 'c',
          :value      => '3',
      ))
      provider = described_class.new(resource)
      provider.value=('3')
      expected_content = <<-EOS
[master]

reports = a:1,b:2,c:3
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should add a new subsetting when the 'parent' setting does not already exist" do
      resource = Puppet::Type::Ini_subsetting.new(common_params.merge(
          :subsetting => 'c',
          :value      => '3',
          :setting    => 'somenewsetting',
      ))
      provider = described_class.new(resource)
      expect(provider.exists?).to be_nil
      provider.value=('3')
      expected_content = <<-EOS
[master]

reports = a:1,b:2
somenewsetting = c:3
      EOS
      validate_file(expected_content, tmpfile)
    end

    it 'should be able to remove the existing subsetting' do
      resource = Puppet::Type::Ini_subsetting.new(common_params.merge(
          :subsetting => 'b',
      ))
      provider = described_class.new(resource)
      expect(provider.exists?).to eq '2'
      provider.destroy
      expected_content = <<-EOS
[master]

reports = a:1
      EOS
      validate_file(expected_content, tmpfile)
    end

    it 'should be able to modify the existing subsetting' do
      resource = Puppet::Type::Ini_subsetting.new(common_params.merge(
          :subsetting => 'b',
          :value      => '5',
      ))
      provider = described_class.new(resource)
      expect(provider.exists?).to eq '2'
      provider.value=('5')
      expected_content = <<-EOS
[master]

reports = a:1,b:5
      EOS
      validate_file(expected_content, tmpfile)
    end

  end

end
