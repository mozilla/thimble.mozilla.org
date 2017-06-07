require 'spec_helper_acceptance'

describe 'concat warn =>' do
  basedir = default.tmpdir('concat')
  context 'true should enable default warning message' do
    pp = <<-EOS
      concat { '#{basedir}/file':
        warn  => true,
      }

      concat::fragment { '1':
        target  => '#{basedir}/file',
        content => '1',
        order   => '01',
      }

      concat::fragment { '2':
        target  => '#{basedir}/file',
        content => '2',
        order   => '02',
      }
    EOS

    it 'applies the manifest twice with no stderr' do
      apply_manifest(pp, :catch_failures => true)
      apply_manifest(pp, :catch_changes => true)
    end

    describe file("#{basedir}/file") do
      it { should be_file }
      its(:content) {
        should match /# This file is managed by Puppet\. DO NOT EDIT\./
        should match /1/
        should match /2/
      }
    end
  end
  context 'false should not enable default warning message' do
    pp = <<-EOS
      concat { '#{basedir}/file':
        warn  => false,
      }

      concat::fragment { '1':
        target  => '#{basedir}/file',
        content => '1',
        order   => '01',
      }

      concat::fragment { '2':
        target  => '#{basedir}/file',
        content => '2',
        order   => '02',
      }
    EOS

    it 'applies the manifest twice with no stderr' do
      apply_manifest(pp, :catch_failures => true)
      apply_manifest(pp, :catch_changes => true)
    end

    describe file("#{basedir}/file") do
      it { should be_file }
      its(:content) {
        should_not match /# This file is managed by Puppet\. DO NOT EDIT\./
        should match /1/
        should match /2/
      }
    end
  end
  context '# foo should overide default warning message' do
    pp = <<-EOS
      concat { '#{basedir}/file':
        warn  => '# foo',
      }

      concat::fragment { '1':
        target  => '#{basedir}/file',
        content => '1',
        order   => '01',
      }

      concat::fragment { '2':
        target  => '#{basedir}/file',
        content => '2',
        order   => '02',
      }
    EOS

    it 'applies the manifest twice with no stderr' do
      apply_manifest(pp, :catch_failures => true)
      apply_manifest(pp, :catch_changes => true)
    end

    describe file("#{basedir}/file") do
      it { should be_file }
      its(:content) {
        should match /# foo/
        should match /1/
        should match /2/
      }
    end
  end
end
