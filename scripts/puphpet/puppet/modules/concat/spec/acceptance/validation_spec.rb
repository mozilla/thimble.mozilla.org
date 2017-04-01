require 'spec_helper_acceptance'

describe 'concat validate_cmd parameter', :unless => (fact('kernel') != 'Linux') do
  basedir = default.tmpdir('concat')
  context '=> "/usr/bin/test -e %"' do
    before(:all) do
      pp = <<-EOS
        file { '#{basedir}':
          ensure => directory
        }
      EOS

      apply_manifest(pp)
    end
    pp = <<-EOS
      concat { '#{basedir}/file':
        validate_cmd => '/usr/bin/test -e %',
      }
      concat::fragment { 'content':
        target  => '#{basedir}/file',
        content => 'content',
      }
    EOS

    it 'applies the manifest twice with no stderr' do
      apply_manifest(pp, :catch_failures => true)
      apply_manifest(pp, :catch_changes => true)
    end

    describe file("#{basedir}/file") do
      it { should be_file }
      it { should contain 'content' }
    end
  end
end
