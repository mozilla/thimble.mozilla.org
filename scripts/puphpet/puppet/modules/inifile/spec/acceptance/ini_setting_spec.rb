require 'spec_helper_acceptance'

tmpdir = default.tmpdir('tmp')

describe 'ini_setting resource' do
  after :all do
    shell("rm #{tmpdir}/*.ini", :acceptable_exit_codes => [0, 1, 2])
  end

  shared_examples 'has_content' do |path, pp, content|
    before :all do
      shell("rm #{path}", :acceptable_exit_codes => [0, 1, 2])
    end
    after :all do
      shell("cat #{path}", :acceptable_exit_codes => [0, 1, 2])
      shell("rm #{path}", :acceptable_exit_codes => [0, 1, 2])
    end

    it 'applies the manifest twice' do
      apply_manifest(pp, :catch_failures => true)
      apply_manifest(pp, :catch_changes => true)
    end

    describe file(path) do
      it { should be_file }
      its(:content) { should match content }
    end
  end

  shared_examples 'has_error' do |path, pp, error|
    before :all do
      shell("rm #{path}", :acceptable_exit_codes => [0, 1, 2])
    end
    after :all do
      shell("cat #{path}", :acceptable_exit_codes => [0, 1, 2])
      shell("rm #{path}", :acceptable_exit_codes => [0, 1, 2])
    end

    it 'applies the manifest and gets a failure message' do
      expect(apply_manifest(pp, :expect_failures => true).stderr).to match(error)
    end

    describe file(path) do
      it { should_not be_file }
    end
  end

  describe 'ensure parameter' do
    context '=> present for global and section' do
      pp = <<-EOS
      ini_setting { 'ensure => present for section':
        ensure  => present,
        path    => "#{tmpdir}/ini_setting.ini",
        section => 'one',
        setting => 'two',
        value   => 'three',
      }
      ini_setting { 'ensure => present for global':
        ensure  => present,
        path    => "#{tmpdir}/ini_setting.ini",
        section => '',
        setting => 'four',
        value   => 'five',
      }
      EOS

      it 'applies the manifest twice' do
        apply_manifest(pp, :catch_failures => true)
        apply_manifest(pp, :catch_changes => true)
      end

      it_behaves_like 'has_content', "#{tmpdir}/ini_setting.ini", pp, /four = five\n\n\[one\]\ntwo = three/
    end

    context '=> present for global and section (from previous blank value)' do
      before :all do
        if fact('osfamily') == 'Darwin'
          shell("echo \"four =[one]\ntwo =\" > #{tmpdir}/ini_setting.ini")
        else
          shell("echo -e \"four =\n[one]\ntwo =\" > #{tmpdir}/ini_setting.ini")
        end
      end

      pp = <<-EOS
      ini_setting { 'ensure => present for section':
        ensure  => present,
        path    => "#{tmpdir}/ini_setting.ini",
        section => 'one',
        setting => 'two',
        value   => 'three',
      }
      ini_setting { 'ensure => present for global':
        ensure  => present,
        path    => "#{tmpdir}/ini_setting.ini",
        section => '',
        setting => 'four',
        value   => 'five',
      }
      EOS

      it 'applies the manifest twice' do
        apply_manifest(pp, :catch_failures => true)
        apply_manifest(pp, :catch_changes => true)
      end

      it_behaves_like 'has_content', "#{tmpdir}/ini_setting.ini", pp, /four = five\n\n\[one\]\ntwo = three/
    end

    context '=> absent for key/value' do
      before :all do
        if fact('osfamily') == 'Darwin'
          shell("echo \"four = five[one]\ntwo = three\" > #{tmpdir}/ini_setting.ini")
        else
          shell("echo -e \"four = five\n[one]\ntwo = three\" > #{tmpdir}/ini_setting.ini")
        end
      end

      pp = <<-EOS
      ini_setting { 'ensure => absent for key/value':
        ensure  => absent,
        path    => "#{tmpdir}/ini_setting.ini",
        section => 'one',
        setting => 'two',
        value   => 'three',
      }
      EOS

      it 'applies the manifest twice' do
        apply_manifest(pp, :catch_failures => true)
        apply_manifest(pp, :catch_changes => true)
      end

      describe file("#{tmpdir}/ini_setting.ini") do
        it { should be_file }
        its(:content) {
          should match /four = five/
          should_not match /\[one\]/
          should_not match /two = three/
        }
      end
    end

    context '=> absent for global' do
      before :all do
        if fact('osfamily') == 'Darwin'
          shell("echo \"four = five\n[one]\ntwo = three\" > #{tmpdir}/ini_setting.ini")
        else
          shell("echo -e \"four = five\n[one]\ntwo = three\" > #{tmpdir}/ini_setting.ini")
        end
      end
      after :all do
        shell("cat #{tmpdir}/ini_setting.ini", :acceptable_exit_codes => [0, 1, 2])
        shell("rm #{tmpdir}/ini_setting.ini", :acceptable_exit_codes => [0, 1, 2])
      end

      pp = <<-EOS
      ini_setting { 'ensure => absent for global':
        ensure  => absent,
        path    => "#{tmpdir}/ini_setting.ini",
        section => '',
        setting => 'four',
        value   => 'five',
      }
      EOS

      it 'applies the manifest twice' do
        apply_manifest(pp, :catch_failures => true)
        apply_manifest(pp, :catch_changes => true)
      end

      describe file("#{tmpdir}/ini_setting.ini") do
        it { should be_file }
        its(:content) {
          should_not match /four = five/
          should match /\[one\]/
          should match /two = three/
        }
      end
    end
  end

  describe 'section, setting, value parameters' do
    {
        "section => 'test', setting => 'foo', value => 'bar',"         => /\[test\]\nfoo = bar/,
        "section => 'more', setting => 'baz', value => 'quux',"        => /\[more\]\nbaz = quux/,
        "section => '',     setting => 'top', value => 'level',"       => /top = level/,
        "section => 'z',    setting => 'sp aces', value => 'foo bar'," => /\[z\]\nsp aces = foo bar/,
    }.each do |parameter_list, content|
      context parameter_list do
        pp = <<-EOS
        ini_setting { "#{parameter_list}":
          ensure  => present,
          path    => "#{tmpdir}/ini_setting.ini",
          #{parameter_list}
        }
        EOS

        it_behaves_like 'has_content', "#{tmpdir}/ini_setting.ini", pp, content
      end
    end

    {
        "section => 'test',"                   => /setting is a required.+value is a required/,
        "setting => 'foo',  value   => 'bar'," => /section is a required/,
        "section => 'test', setting => 'foo'," => /value is a required/,
        "section => 'test', value   => 'bar'," => /setting is a required/,
        "value   => 'bar',"                    => /section is a required.+setting is a required/,
        "setting => 'foo',"                    => /section is a required.+value is a required/,
    }.each do |parameter_list, error|
      context parameter_list, :pending => 'no error checking yet' do
        pp = <<-EOS
        ini_setting { "#{parameter_list}":
          ensure  => present,
          path    => "#{tmpdir}/ini_setting.ini",
          #{parameter_list}
        }
        EOS

        it_behaves_like 'has_error', "#{tmpdir}/ini_setting.ini", pp, error
      end
    end
  end

  describe 'path parameter' do
    [
        "#{tmpdir}/one.ini",
        "#{tmpdir}/two.ini",
        "#{tmpdir}/three.ini",
    ].each do |path|
      context "path => #{path}" do
        pp = <<-EOS
        ini_setting { 'path => #{path}':
          ensure  => present,
          section => 'one',
          setting => 'two',
          value   => 'three',
          path    => '#{path}',
        }
        EOS

        it_behaves_like 'has_content', path, pp, /\[one\]\ntwo = three/
      end
    end

    context "path => foo" do
      pp = <<-EOS
        ini_setting { 'path => foo':
          ensure     => present,
          section    => 'one',
          setting    => 'two',
          value      => 'three',
          path       => 'foo',
        }
      EOS

      it_behaves_like 'has_error', 'foo', pp, /must be fully qualified/
    end
  end

  describe 'key_val_separator parameter' do
    {
        ""                             => /two = three/,
        "key_val_separator => '=',"    => /two=three/,
        "key_val_separator => ' =  '," => /two =  three/,
        "key_val_separator => ' '," => /two three/,
        "key_val_separator => '   '," => /two   three/,
    }.each do |parameter, content|
      context "with \"#{parameter}\" makes \"#{content}\"" do
        pp = <<-EOS
        ini_setting { "with #{parameter} makes #{content}":
          ensure  => present,
          section => 'one',
          setting => 'two',
          value   => 'three',
          path    => "#{tmpdir}/key_val_separator.ini",
          #{parameter}
        }
        EOS

        it_behaves_like 'has_content', "#{tmpdir}/key_val_separator.ini", pp, content
      end
    end
  end

  describe 'show_diff parameter and logging:' do
    [ {:value => "initial_value", :matcher => "created", :show_diff => true},
      {:value => "public_value", :matcher => /initial_value.*public_value/, :show_diff => true},
      {:value => "secret_value", :matcher => /redacted sensitive information.*redacted sensitive information/, :show_diff => false},
      {:value => "md5_value", :matcher => /{md5}881671aa2bbc680bc530c4353125052b.*{md5}ed0903a7fa5de7886ca1a7a9ad06cf51/, :show_diff => :md5}
    ].each do |i|
      context "show_diff => #{i[:show_diff]}" do
        pp = <<-EOS
          ini_setting { 'test_show_diff':
            ensure      => present,
            section     => 'test',
            setting     => 'something',
            value       => '#{i[:value]}',
            path        => "#{tmpdir}/test_show_diff.ini",
            show_diff   => #{i[:show_diff]} 
          }
        EOS

        it "applies manifest and expects changed value to be logged in proper form" do
          config = {
            'main' => {
              'show_diff'   => true
            }
          }
          configure_puppet_on(default, config)

          res = apply_manifest(pp, :expect_changes => true)
          expect(res.stdout).to match(i[:matcher])
          expect(res.stdout).not_to match(i[:value]) unless (i[:show_diff] == true)

        end
      end
    end
  end

end
