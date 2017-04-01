require 'spec_helper'
require 'puppet'

provider_class = Puppet::Type.type(:ini_setting).provider(:ruby)
describe provider_class do
  include PuppetlabsSpec::Files

  let(:tmpfile) { tmpfilename("ini_setting_test") }
  let(:emptyfile) { tmpfilename("ini_setting_test_empty") }

  let(:common_params) { {
      :title    => 'ini_setting_ensure_present_test',
      :path     => tmpfile,
      :section  => 'section2',
  } }

  def validate_file(expected_content,tmpfile = tmpfile)
    expect(File.read(tmpfile)).to eq(expected_content)
  end


  before :each do
    File.open(tmpfile, 'w') do |fh|
      fh.write(orig_content)
    end
    File.open(emptyfile, 'w') do |fh|
      fh.write("")
    end
  end

  context 'when calling instances' do

    let :orig_content do
      ''
    end

    it 'should fail when file path is not set' do
      expect {
        provider_class.instances
      }.to raise_error(Puppet::Error, 'Ini_settings only support collecting instances when a file path is hard coded')
    end

    context 'when file path is set by a child class' do
      it 'should return [] when file is empty' do
        child_one = Class.new(provider_class) do
          def self.file_path
            emptyfile
          end
        end
        child_one.stubs(:file_path).returns(emptyfile)
        expect(child_one.instances).to eq([])
      end
      it 'should override the provider instances file_path' do
        child_two = Class.new(provider_class) do
          def self.file_path
            '/some/file/path'
          end
        end
        resource = Puppet::Type::Ini_setting.new(common_params)
        provider = child_two.new(resource)
        expect(provider.file_path).to eq('/some/file/path')
      end
      context 'when file has contecnts' do
        let(:orig_content) {
          <<-EOS
# This is a comment
[section1]
; This is also a comment
foo=foovalue

bar = barvalue
master = true
[section2]

foo= foovalue2
baz=bazvalue
url = http://192.168.1.1:8080
[section:sub]
subby=bar
    #another comment
 ; yet another comment
          EOS
        }

        it 'should be able to parse the results' do
          child_three = Class.new(provider_class) do
            def self.file_path
              '/some/file/path'
            end
          end
          child_three.stubs(:file_path).returns(tmpfile)
          expect(child_three.instances.size).to eq(7)
          expected_array = [
            {:name => 'section1/foo', :value => 'foovalue' },
            {:name => 'section1/bar', :value => 'barvalue' },
            {:name => 'section1/master', :value => 'true' },
            {:name => 'section2/foo', :value => 'foovalue2' },
            {:name => 'section2/baz', :value => 'bazvalue' },
            {:name => 'section2/url', :value => 'http://192.168.1.1:8080' },
            {:name => 'section:sub/subby', :value => 'bar' }
          ]
          real_array = []
          ensure_array = []
          child_three.instances.each do |x|
            prop_hash    = x.instance_variable_get(:@property_hash)
            ensure_value = prop_hash.delete(:ensure)
            ensure_array.push(ensure_value)
            real_array.push(prop_hash)
          end
          expect(ensure_array.uniq).to eq([:present])
          expect(((real_array - expected_array) && (expected_array - real_array))).to eq([])

        end

      end

    end

  end

  context "when ensuring that a setting is present" do
    let(:orig_content) {
      <<-EOS
# This is a comment
[section1]
; This is also a comment
foo=foovalue

bar = barvalue
master = true
[section2]

foo= foovalue2
baz=bazvalue
url = http://192.168.1.1:8080
[section:sub]
subby=bar
    #another comment
 ; yet another comment

-nonstandard-
  shoes = purple
      EOS
    }

    it "should add a missing setting to the correct section" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
          :setting => 'yahoo', :value => 'yippee'))
      provider = described_class.new(resource)
      expect(provider.exists?).to be false
      provider.create
      expected_content = <<-EOS
# This is a comment
[section1]
; This is also a comment
foo=foovalue

bar = barvalue
master = true
[section2]

foo= foovalue2
baz=bazvalue
url = http://192.168.1.1:8080
yahoo = yippee
[section:sub]
subby=bar
    #another comment
 ; yet another comment

-nonstandard-
  shoes = purple
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should add a missing setting to the correct section with pre/suffix" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
          :section => 'nonstandard',
          :setting => 'yahoo', :value => 'yippee',
          :section_prefix => '-', :section_suffix => '-'))
      provider = described_class.new(resource)
      expect(provider.exists?).to be false
      provider.create
      expected_content = <<-EOS
# This is a comment
[section1]
; This is also a comment
foo=foovalue

bar = barvalue
master = true
[section2]

foo= foovalue2
baz=bazvalue
url = http://192.168.1.1:8080
[section:sub]
subby=bar
    #another comment
 ; yet another comment

-nonstandard-
  shoes = purple
  yahoo = yippee
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should add a missing setting to the correct section with colon" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
          :section => 'section:sub', :setting => 'yahoo', :value => 'yippee'))
      provider = described_class.new(resource)
      expect(provider.exists?).to be false
      provider.create
      expected_content = <<-EOS
# This is a comment
[section1]
; This is also a comment
foo=foovalue

bar = barvalue
master = true
[section2]

foo= foovalue2
baz=bazvalue
url = http://192.168.1.1:8080
[section:sub]
subby=bar
    #another comment
 ; yet another comment

-nonstandard-
  shoes = purple
yahoo = yippee
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should modify an existing setting with a different value" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
           :setting => 'baz', :value => 'bazvalue2'))
      provider = described_class.new(resource)
      provider.exists?.should be true
      provider.value=('bazvalue2')
      expected_content = <<-EOS
# This is a comment
[section1]
; This is also a comment
foo=foovalue

bar = barvalue
master = true
[section2]

foo= foovalue2
baz=bazvalue2
url = http://192.168.1.1:8080
[section:sub]
subby=bar
    #another comment
 ; yet another comment

-nonstandard-
  shoes = purple
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should modify an existing setting with a different boolean value" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
        :section => 'section1', :setting => 'master', :value => false))
      provider = described_class.new(resource)
      provider.exists?.should be true
      transaction = double('transaction', :persistence => true)
      expect(Puppet::Transaction::ResourceHarness.new(transaction).evaluate(provider.resource).out_of_sync).to eq(true)
      expected_content = <<-EOS
# This is a comment
[section1]
; This is also a comment
foo=foovalue

bar = barvalue
master = false
[section2]

foo= foovalue2
baz=bazvalue
url = http://192.168.1.1:8080
[section:sub]
subby=bar
    #another comment
 ; yet another comment

-nonstandard-
  shoes = purple
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should modify an existing setting with pre/suffix with a different value" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
           :section => 'nonstandard',
           :setting => 'shoes', :value => 'orange',
           :section_prefix => '-', :section_suffix => '-' ))
      provider = described_class.new(resource)
      provider.exists?.should be true
      provider.value=('orange')
      expected_content = <<-EOS
# This is a comment
[section1]
; This is also a comment
foo=foovalue

bar = barvalue
master = true
[section2]

foo= foovalue2
baz=bazvalue
url = http://192.168.1.1:8080
[section:sub]
subby=bar
    #another comment
 ; yet another comment

-nonstandard-
  shoes = orange
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should modify an existing setting with a different value - with colon in section" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
           :section => 'section:sub', :setting => 'subby', :value => 'foo'))
      provider = described_class.new(resource)
      provider.exists?.should be true
      provider.value.should eq('bar')
      provider.value=('foo')
      expected_content = <<-EOS
# This is a comment
[section1]
; This is also a comment
foo=foovalue

bar = barvalue
master = true
[section2]

foo= foovalue2
baz=bazvalue
url = http://192.168.1.1:8080
[section:sub]
subby=foo
    #another comment
 ; yet another comment

-nonstandard-
  shoes = purple
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should be able to handle settings with non alphanumbering settings " do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
           :setting => 'url', :value => 'http://192.168.0.1:8080'))
      provider = described_class.new(resource)
      provider.exists?.should be true
      provider.value.should eq('http://192.168.1.1:8080')
      provider.value=('http://192.168.0.1:8080')
      expected_content = <<-EOS
# This is a comment
[section1]
; This is also a comment
foo=foovalue

bar = barvalue
master = true
[section2]

foo= foovalue2
baz=bazvalue
url = http://192.168.0.1:8080
[section:sub]
subby=bar
    #another comment
 ; yet another comment

-nonstandard-
  shoes = purple
    EOS
      validate_file(expected_content, tmpfile)
    end

    it "should be able to handle settings with pre/suffix with non alphanumbering settings " do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
           :section => 'nonstandard',
           :setting => 'shoes', :value => 'http://192.168.0.1:8080',
           :section_prefix => '-', :section_suffix => '-' ))
      provider = described_class.new(resource)
      provider.exists?.should be true
      provider.value.should eq('purple')
      provider.value=('http://192.168.0.1:8080')
      expected_content = <<-EOS
# This is a comment
[section1]
; This is also a comment
foo=foovalue

bar = barvalue
master = true
[section2]

foo= foovalue2
baz=bazvalue
url = http://192.168.1.1:8080
[section:sub]
subby=bar
    #another comment
 ; yet another comment

-nonstandard-
  shoes = http://192.168.0.1:8080
    EOS
      validate_file(expected_content, tmpfile)
    end

    it "should recognize an existing setting with the specified value" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
           :setting => 'baz', :value => 'bazvalue'))
      provider = described_class.new(resource)
      provider.exists?.should be true
    end

    it "should recognize an existing setting with pre/suffix with the specified value" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
           :section => 'nonstandard',
           :setting => 'shoes', :value => 'purple',
           :section_prefix => '-', :section_suffix => '-' ))
      provider = described_class.new(resource)
      provider.exists?.should be true
    end

    it "should add a new section if the section does not exist" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
          :section => "section3", :setting => 'huzzah', :value => 'shazaam'))
      provider = described_class.new(resource)
      provider.exists?.should be false
      provider.create
      expected_content = <<-EOS
# This is a comment
[section1]
; This is also a comment
foo=foovalue

bar = barvalue
master = true
[section2]

foo= foovalue2
baz=bazvalue
url = http://192.168.1.1:8080
[section:sub]
subby=bar
    #another comment
 ; yet another comment

-nonstandard-
  shoes = purple

[section3]
huzzah = shazaam
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should add a new section with pre/suffix if the section does not exist" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
          :section => "section3", :setting => 'huzzah', :value => 'shazaam',
          :section_prefix => '-', :section_suffix => '-' ))
      provider = described_class.new(resource)
      provider.exists?.should be false
      provider.create
      expected_content = <<-EOS
# This is a comment
[section1]
; This is also a comment
foo=foovalue

bar = barvalue
master = true
[section2]

foo= foovalue2
baz=bazvalue
url = http://192.168.1.1:8080
[section:sub]
subby=bar
    #another comment
 ; yet another comment

-nonstandard-
  shoes = purple

-section3-
huzzah = shazaam
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should add a new section if the section does not exist - with colon" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
          :section => "section:subsection", :setting => 'huzzah', :value => 'shazaam'))
      provider = described_class.new(resource)
      provider.exists?.should be false
      provider.create
      expected_content = <<-EOS
# This is a comment
[section1]
; This is also a comment
foo=foovalue

bar = barvalue
master = true
[section2]

foo= foovalue2
baz=bazvalue
url = http://192.168.1.1:8080
[section:sub]
subby=bar
    #another comment
 ; yet another comment

-nonstandard-
  shoes = purple

[section:subsection]
huzzah = shazaam
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should add a new section with pre/suffix if the section does not exist - with colon" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
          :section => "section:subsection", :setting => 'huzzah', :value => 'shazaam',
          :section_prefix => '-', :section_suffix => '-' ))
      provider = described_class.new(resource)
      provider.exists?.should be false
      provider.create
      expected_content = <<-EOS
# This is a comment
[section1]
; This is also a comment
foo=foovalue

bar = barvalue
master = true
[section2]

foo= foovalue2
baz=bazvalue
url = http://192.168.1.1:8080
[section:sub]
subby=bar
    #another comment
 ; yet another comment

-nonstandard-
  shoes = purple

-section:subsection-
huzzah = shazaam
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should add a new section if no sections exists" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
          :section => "section1", :setting => 'setting1', :value => 'hellowworld', :path => emptyfile))
      provider = described_class.new(resource)
      provider.exists?.should be false
      provider.create
      validate_file("
[section1]
setting1 = hellowworld
", emptyfile)
    end

    it "should add a new section with pre/suffix if no sections exists" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
          :section => "section1", :setting => 'setting1', :value => 'hellowworld', :path => emptyfile,
          :section_prefix => '-', :section_suffix => '-' ))
      provider = described_class.new(resource)
      provider.exists?.should be false
      provider.create
      validate_file("
-section1-
setting1 = hellowworld
", emptyfile)
    end

    it "should add a new section with colon if no sections exists" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
          :section => "section:subsection", :setting => 'setting1', :value => 'hellowworld', :path => emptyfile))
      provider = described_class.new(resource)
      provider.exists?.should be false
      provider.create
      validate_file("
[section:subsection]
setting1 = hellowworld
", emptyfile)
    end

    it "should add a new section with pre/suffix with colon if no sections exists" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
          :section => "section:subsection", :setting => 'setting1', :value => 'hellowworld', :path => emptyfile,
          :section_prefix => '-', :section_suffix => '-' ))
      provider = described_class.new(resource)
      provider.exists?.should be false
      provider.create
      validate_file("
-section:subsection-
setting1 = hellowworld
", emptyfile)
    end
    it "should be able to handle variables of any type" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
          :section => "section1", :setting => 'master', :value => true))
      provider = described_class.new(resource)
      provider.exists?.should be true
      provider.value.should == 'true'
    end

  end

  context "when dealing with a global section" do
    let(:orig_content) {
      <<-EOS
# This is a comment
foo=blah
[section2]
foo = http://192.168.1.1:8080
 ; yet another comment
      EOS
    }


    it "should add a missing setting if it doesn't exist" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
          :section => '', :setting => 'bar', :value => 'yippee'))
      provider = described_class.new(resource)
      provider.exists?.should be false
      provider.create
      expected_content = <<-EOS
# This is a comment
foo=blah
bar = yippee
[section2]
foo = http://192.168.1.1:8080
 ; yet another comment
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should modify an existing setting with a different value" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
           :section => '', :setting => 'foo', :value => 'yippee'))
      provider = described_class.new(resource)
      provider.exists?.should be true
      provider.value.should eq('blah')
      provider.value=('yippee')
      expected_content = <<-EOS
# This is a comment
foo=yippee
[section2]
foo = http://192.168.1.1:8080
 ; yet another comment
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should recognize an existing setting with the specified value" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
           :section => '', :setting => 'foo', :value => 'blah'))
      provider = described_class.new(resource)
      provider.exists?.should be true
    end
  end

  context "when the first line of the file is a section" do
    let(:orig_content) {
      <<-EOS
[section2]
foo = http://192.168.1.1:8080
      EOS
    }

    it "should be able to add a global setting" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
           :section => '', :setting => 'foo', :value => 'yippee'))
      provider = described_class.new(resource)
      provider.exists?.should be false
      provider.create
      expected_content = <<-EOS
foo = yippee

[section2]
foo = http://192.168.1.1:8080
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should modify an existing setting" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
          :section => 'section2', :setting => 'foo', :value => 'yippee'))
      provider = described_class.new(resource)
      provider.exists?.should be true
      provider.value.should eq('http://192.168.1.1:8080')
      provider.value=('yippee')
      expected_content = <<-EOS
[section2]
foo = yippee
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should add a new setting" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
          :section => 'section2', :setting => 'bar', :value => 'baz'))
      provider = described_class.new(resource)
      provider.exists?.should be false
      provider.create
      expected_content = <<-EOS
[section2]
foo = http://192.168.1.1:8080
bar = baz
      EOS
      validate_file(expected_content, tmpfile)
    end
  end

  context "when overriding the separator" do
    let(:orig_content) {
      <<-EOS
[section2]
foo=bar
      EOS
    }

    it "should modify an existing setting" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
                                                   :section           => 'section2',
                                                   :setting           => 'foo',
                                                   :value             => 'yippee',
                                                   :key_val_separator => '='))
      provider = described_class.new(resource)
      provider.exists?.should be true
      provider.value.should eq('bar')
      provider.value=('yippee')
      expected_content = <<-EOS
[section2]
foo=yippee
      EOS
      validate_file(expected_content, tmpfile)
    end

  end

  context "when overriding the separator to something other than =" do
    let(:orig_content) {
      <<-EOS
[section2]
foo: bar
      EOS
    }

    it "should modify an existing setting" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
                                                   :section           => 'section2',
                                                   :setting           => 'foo',
                                                   :value             => 'yippee',
                                                   :key_val_separator => ': '))
      provider = described_class.new(resource)
      provider.exists?.should be true
      provider.value.should eq('bar')
      provider.value=('yippee')
      expected_content = <<-EOS
[section2]
foo: yippee
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should add a new setting" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
                                                   :section           => 'section2',
                                                   :setting           => 'bar',
                                                   :value             => 'baz',
                                                   :key_val_separator => ': '))
      provider = described_class.new(resource)
      provider.exists?.should be false
      provider.create
      expected_content = <<-EOS
[section2]
foo: bar
bar: baz
      EOS
      validate_file(expected_content, tmpfile)
    end

  end

  context "when overriding the separator to a space" do
    let(:orig_content) {
      <<-EOS
[section2]
foo bar
      EOS
    }

    it "should modify an existing setting" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
                                                   :section           => 'section2',
                                                   :setting           => 'foo',
                                                   :value             => 'yippee',
                                                   :key_val_separator => ' '))
      provider = described_class.new(resource)
      provider.exists?.should be true
      provider.value.should eq('bar')
      provider.value=('yippee')
      expected_content = <<-EOS
[section2]
foo yippee
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should add a new setting" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
                                                   :section           => 'section2',
                                                   :setting           => 'bar',
                                                   :value             => 'baz',
                                                   :key_val_separator => ' '))
      provider = described_class.new(resource)
      provider.exists?.should be false
      provider.create
      expected_content = <<-EOS
[section2]
foo bar
bar baz
      EOS
      validate_file(expected_content, tmpfile)
    end
  end

  context "when ensuring that a setting is absent" do
    let(:orig_content) {
      <<-EOS
[section1]
; This is also a comment
foo=foovalue

bar = barvalue
master = true
[section2]

foo= foovalue2
baz=bazvalue
url = http://192.168.1.1:8080
[section3]
# com = ment
uncom = ment
[section4]
uncom = ment
[section:sub]
subby=bar
    #another comment
 ; yet another comment

 -nonstandard-
   shoes = purple
EOS
    }

    it "should remove a setting that exists" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
      :section => 'section1', :setting => 'foo', :ensure => 'absent'))
      provider = described_class.new(resource)
      provider.exists?.should be true
      provider.destroy
      expected_content = <<-EOS
[section1]
; This is also a comment

bar = barvalue
master = true
[section2]

foo= foovalue2
baz=bazvalue
url = http://192.168.1.1:8080
[section3]
# com = ment
uncom = ment
[section4]
uncom = ment
[section:sub]
subby=bar
    #another comment
 ; yet another comment

 -nonstandard-
   shoes = purple
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should remove a setting with pre/suffix that exists" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
      :section => 'nonstandard', :setting => 'shoes', :ensure => 'absent',
      :section_prefix => '-', :section_suffix => '-' ))
      provider = described_class.new(resource)
      provider.exists?.should be true
      provider.destroy
      expected_content = <<-EOS
[section1]
; This is also a comment
foo=foovalue

bar = barvalue
master = true
[section2]

foo= foovalue2
baz=bazvalue
url = http://192.168.1.1:8080
[section3]
# com = ment
uncom = ment
[section4]
uncom = ment
[section:sub]
subby=bar
    #another comment
 ; yet another comment

    EOS
    validate_file(expected_content, tmpfile)
    end

    it "should do nothing for a setting that does not exist" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
                                                   :section => 'section:sub', :setting => 'foo', :ensure => 'absent'))
      provider = described_class.new(resource)
      provider.exists?.should be false
      provider.destroy
      expected_content = <<-EOS
[section1]
; This is also a comment
foo=foovalue

bar = barvalue
master = true
[section2]

foo= foovalue2
baz=bazvalue
url = http://192.168.1.1:8080
[section3]
# com = ment
uncom = ment
[section4]
uncom = ment
[section:sub]
subby=bar
    #another comment
 ; yet another comment

 -nonstandard-
   shoes = purple
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should do nothing for a setting with pre/suffix that does not exist" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
         :section => 'nonstandard', :setting => 'foo', :ensure => 'absent',
         :section_prefix => '-', :section_suffix => '-' ))
      provider = described_class.new(resource)
      provider.exists?.should be false
      provider.destroy
      expected_content = <<-EOS
[section1]
; This is also a comment
foo=foovalue

bar = barvalue
master = true
[section2]

foo= foovalue2
baz=bazvalue
url = http://192.168.1.1:8080
[section3]
# com = ment
uncom = ment
[section4]
uncom = ment
[section:sub]
subby=bar
    #another comment
 ; yet another comment

 -nonstandard-
   shoes = purple
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "does not remove a section when the last uncommented setting is removed if there are comments" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
        :section => 'section3',
        :setting => 'uncom',
        :ensure => 'absent',
      ))
      provider = described_class.new(resource)
      provider.exists?.should be true
      provider.destroy
      expected_content = <<-EOS
[section1]
; This is also a comment
foo=foovalue

bar = barvalue
master = true
[section2]

foo= foovalue2
baz=bazvalue
url = http://192.168.1.1:8080
[section3]
# com = ment
[section4]
uncom = ment
[section:sub]
subby=bar
    #another comment
 ; yet another comment

 -nonstandard-
   shoes = purple
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "removes the section when removing the last line in the section" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
        :section => 'section4',
        :setting => 'uncom',
        :ensure => 'absent',
      ))
      provider = described_class.new(resource)
      provider.exists?.should be true
      provider.destroy
      expected_content = <<-EOS
[section1]
; This is also a comment
foo=foovalue

bar = barvalue
master = true
[section2]

foo= foovalue2
baz=bazvalue
url = http://192.168.1.1:8080
[section3]
# com = ment
uncom = ment
[section:sub]
subby=bar
    #another comment
 ; yet another comment

 -nonstandard-
   shoes = purple
      EOS
      validate_file(expected_content, tmpfile)
    end
  end

  context "when dealing with indentation in sections" do
    let(:orig_content) {
      <<-EOS
# This is a comment
     [section1]
     ; This is also a comment
     foo=foovalue

     bar = barvalue
     master = true

[section2]
  foo= foovalue2
  baz=bazvalue
  url = http://192.168.1.1:8080
[section:sub]
 subby=bar
    #another comment
  fleezy = flam
 ; yet another comment
      EOS
    }

    it "should add a missing setting at the correct indentation when the header is aligned" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
                    :section => 'section1', :setting => 'yahoo', :value => 'yippee'))
      provider = described_class.new(resource)
      provider.exists?.should be false
      provider.create
      expected_content = <<-EOS
# This is a comment
     [section1]
     ; This is also a comment
     foo=foovalue

     bar = barvalue
     master = true
     yahoo = yippee

[section2]
  foo= foovalue2
  baz=bazvalue
  url = http://192.168.1.1:8080
[section:sub]
 subby=bar
    #another comment
  fleezy = flam
 ; yet another comment
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should update an existing setting at the correct indentation when the header is aligned" do
      resource = Puppet::Type::Ini_setting.new(
          common_params.merge(:section => 'section1', :setting => 'bar', :value => 'barvalue2'))
      provider = described_class.new(resource)
      provider.exists?.should be true
      provider.create
      expected_content = <<-EOS
# This is a comment
     [section1]
     ; This is also a comment
     foo=foovalue

     bar = barvalue2
     master = true

[section2]
  foo= foovalue2
  baz=bazvalue
  url = http://192.168.1.1:8080
[section:sub]
 subby=bar
    #another comment
  fleezy = flam
 ; yet another comment
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should add a missing setting at the correct indentation when the header is not aligned" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
                                                   :section => 'section2', :setting => 'yahoo', :value => 'yippee'))
      provider = described_class.new(resource)
      provider.exists?.should be false
      provider.create
      expected_content = <<-EOS
# This is a comment
     [section1]
     ; This is also a comment
     foo=foovalue

     bar = barvalue
     master = true

[section2]
  foo= foovalue2
  baz=bazvalue
  url = http://192.168.1.1:8080
  yahoo = yippee
[section:sub]
 subby=bar
    #another comment
  fleezy = flam
 ; yet another comment
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should update an existing setting at the correct indentation when the header is not aligned" do
      resource = Puppet::Type::Ini_setting.new(
          common_params.merge(:section => 'section2', :setting => 'baz', :value => 'bazvalue2'))
      provider = described_class.new(resource)
      provider.exists?.should be true
      provider.create
      expected_content = <<-EOS
# This is a comment
     [section1]
     ; This is also a comment
     foo=foovalue

     bar = barvalue
     master = true

[section2]
  foo= foovalue2
  baz=bazvalue2
  url = http://192.168.1.1:8080
[section:sub]
 subby=bar
    #another comment
  fleezy = flam
 ; yet another comment
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should add a missing setting at the min indentation when the section is not aligned" do
      resource = Puppet::Type::Ini_setting.new(
          common_params.merge(:section => 'section:sub', :setting => 'yahoo', :value => 'yippee'))
      provider = described_class.new(resource)
      provider.exists?.should be false
      provider.create
      expected_content = <<-EOS
# This is a comment
     [section1]
     ; This is also a comment
     foo=foovalue

     bar = barvalue
     master = true

[section2]
  foo= foovalue2
  baz=bazvalue
  url = http://192.168.1.1:8080
[section:sub]
 subby=bar
    #another comment
  fleezy = flam
 ; yet another comment
 yahoo = yippee
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should update an existing setting at the previous indentation when the section is not aligned" do
      resource = Puppet::Type::Ini_setting.new(
          common_params.merge(:section => 'section:sub', :setting => 'fleezy', :value => 'flam2'))
      provider = described_class.new(resource)
      provider.exists?.should be true
      provider.create
      expected_content = <<-EOS
# This is a comment
     [section1]
     ; This is also a comment
     foo=foovalue

     bar = barvalue
     master = true

[section2]
  foo= foovalue2
  baz=bazvalue
  url = http://192.168.1.1:8080
[section:sub]
 subby=bar
    #another comment
  fleezy = flam2
 ; yet another comment
      EOS
      validate_file(expected_content, tmpfile)
    end

  end


  context "when dealing settings that have a commented version present" do
    let(:orig_content) {
      <<-EOS
     [section1]
     # foo=foovalue
     bar=barvalue
     foo = foovalue2

[section2]
# foo = foovalue
;bar=barvalue
blah = blah
#baz=
      EOS
    }

    it "should add a new setting below a commented version of that setting" do
      resource = Puppet::Type::Ini_setting.new(
          common_params.merge(:section => 'section2', :setting => 'foo', :value => 'foo3'))
      provider = described_class.new(resource)
      provider.exists?.should be false
      provider.create
      expected_content = <<-EOS
     [section1]
     # foo=foovalue
     bar=barvalue
     foo = foovalue2

[section2]
# foo = foovalue
foo = foo3
;bar=barvalue
blah = blah
#baz=
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should update an existing setting in place, even if there is a commented version of that setting" do
      resource = Puppet::Type::Ini_setting.new(
          common_params.merge(:section => 'section1', :setting => 'foo', :value => 'foo3'))
      provider = described_class.new(resource)
      provider.exists?.should be true
      provider.create
      expected_content = <<-EOS
     [section1]
     # foo=foovalue
     bar=barvalue
     foo = foo3

[section2]
# foo = foovalue
;bar=barvalue
blah = blah
#baz=
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should add a new setting below a commented version of that setting, respecting semicolons as comments" do
      resource = Puppet::Type::Ini_setting.new(
          common_params.merge(:section => 'section2', :setting => 'bar', :value => 'bar3'))
      provider = described_class.new(resource)
      provider.exists?.should be false
      provider.create
      expected_content = <<-EOS
     [section1]
     # foo=foovalue
     bar=barvalue
     foo = foovalue2

[section2]
# foo = foovalue
;bar=barvalue
bar=bar3
blah = blah
#baz=
      EOS
      validate_file(expected_content, tmpfile)
    end

    it "should add a new setting below an empty commented version of that setting" do
      resource = Puppet::Type::Ini_setting.new(
          common_params.merge(:section => 'section2', :setting => 'baz', :value => 'bazvalue'))
      provider = described_class.new(resource)
      provider.exists?.should be false
      provider.create
      expected_content = <<-EOS
     [section1]
     # foo=foovalue
     bar=barvalue
     foo = foovalue2

[section2]
# foo = foovalue
;bar=barvalue
blah = blah
#baz=
baz=bazvalue
      EOS
      validate_file(expected_content, tmpfile)
    end

    context 'when a section only contains comments' do
     let(:orig_content) {
      <<-EOS
[section1]
# foo=foovalue
# bar=bar2
EOS
    }

      it 'should be able to add a new setting when a section contains only comments' do
        resource = Puppet::Type::Ini_setting.new(
          common_params.merge(:section => 'section1', :setting => 'foo', :value => 'foovalue2')
        )
        provider = described_class.new(resource)
        provider.exists?.should be false
        provider.create
        expected_content = <<-EOS
[section1]
# foo=foovalue
foo=foovalue2
# bar=bar2
        EOS
        validate_file(expected_content, tmpfile)
      end

      it 'should be able to add a new setting when it matches a commented out line other than the first one' do
        resource = Puppet::Type::Ini_setting.new(
          common_params.merge(:section => 'section1', :setting => 'bar', :value => 'barvalue2')
        )
        provider = described_class.new(resource)
        provider.exists?.should be false
        provider.create
        expected_content = <<-EOS
[section1]
# foo=foovalue
# bar=bar2
bar=barvalue2
        EOS
        validate_file(expected_content, tmpfile)
      end
    end

    context "when sections have spaces and dashes" do
      let(:orig_content) {
        <<-EOS
# This is a comment
[section - one]
; This is also a comment
foo=foovalue

bar = barvalue
master = true
[section - two]

foo= foovalue2
baz=bazvalue
url = http://192.168.1.1:8080
[section:sub]
subby=bar
    #another comment
 ; yet another comment
        EOS
      }

      it "should add a missing setting to the correct section" do
        resource = Puppet::Type::Ini_setting.new(common_params.merge(
            :section => 'section - two', :setting => 'yahoo', :value => 'yippee'))
        provider = described_class.new(resource)
        provider.exists?.should be false
        provider.create
        expected_content = <<-EOS
# This is a comment
[section - one]
; This is also a comment
foo=foovalue

bar = barvalue
master = true
[section - two]

foo= foovalue2
baz=bazvalue
url = http://192.168.1.1:8080
yahoo = yippee
[section:sub]
subby=bar
    #another comment
 ; yet another comment
        EOS
        validate_file(expected_content, tmpfile)
      end

    end

  end

  context "when sections have spaces and quotations" do
    let(:orig_content) do
      <<-EOS
[branch "master"]
        remote = origin
        merge = refs/heads/master

[alias]
to-deploy = log --merges --grep='pull request' --format='%s (%cN)' origin/production..origin/master
[branch "production"]
        remote = origin
        merge = refs/heads/production
      EOS
    end

    it "should add a missing setting to the correct section" do
      resource = Puppet::Type::Ini_setting.new(common_params.merge(
        :section => 'alias',
        :setting => 'foo',
        :value => 'bar'
      ))
      provider = described_class.new(resource)
      provider.exists?.should be false
      provider.create
      expected_content = <<-EOS
[branch "master"]
        remote = origin
        merge = refs/heads/master

[alias]
to-deploy = log --merges --grep='pull request' --format='%s (%cN)' origin/production..origin/master
foo = bar
[branch "production"]
        remote = origin
        merge = refs/heads/production
      EOS
      validate_file(expected_content, tmpfile)
    end
  end
end
