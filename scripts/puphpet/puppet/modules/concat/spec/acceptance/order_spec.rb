require 'spec_helper_acceptance'

describe 'concat order' do
  basedir = default.tmpdir('concat')

  context '=> ' do
    shared_examples 'sortby' do |order_by, match_output|
      pp = <<-EOS
      concat { '#{basedir}/foo':
        order => '#{order_by}'
      }
      concat::fragment { '1':
        target  => '#{basedir}/foo',
        content => 'string1',
        order   => '1',
      }
      concat::fragment { '2':
        target  => '#{basedir}/foo',
        content => 'string2',
        order   => '2',
      }
      concat::fragment { '10':
        target  => '#{basedir}/foo',
        content => 'string10',
      }
      EOS

      it 'applies the manifest twice with no stderr' do
        apply_manifest(pp, :catch_failures => true)
        apply_manifest(pp, :catch_changes => true)
      end

      describe file("#{basedir}/foo") do
        it { should be_file }
        its(:content) { should match match_output }
      end
    end

    describe 'alpha' do
      it_behaves_like 'sortby', 'alpha', /string10string1string2/
    end

    describe 'numeric' do
      it_behaves_like 'sortby', 'numeric', /string1string2string10/
    end
  end
end # concat order

describe 'concat::fragment order' do
  basedir = default.tmpdir('concat')

  context '=> reverse order' do
    shared_examples 'order_by' do |order_by, match_output|
      pp = <<-EOS
      concat { '#{basedir}/foo':
          order => '#{order_by}'
      }
      concat::fragment { '1':
        target  => '#{basedir}/foo',
        content => 'string1',
        order   => '15',
      }
      concat::fragment { '2':
        target  => '#{basedir}/foo',
        content => 'string2',
        # default order 10
      }
      concat::fragment { '3':
        target  => '#{basedir}/foo',
        content => 'string3',
        order   => '1',
      }
      EOS

      it 'applies the manifest twice with no stderr' do
        apply_manifest(pp, :catch_failures => true)
        apply_manifest(pp, :catch_changes => true)
      end

      describe file("#{basedir}/foo") do
        it { should be_file }
        its(:content) { should match match_output }
      end
    end
    describe 'alpha' do
      it_should_behave_like 'order_by', 'alpha', /string2string1string3/
    end
    describe 'numeric' do
      it_should_behave_like 'order_by', 'numeric', /string3string2string1/
    end
  end

  context '=> normal order' do
    pp = <<-EOS
      concat { '#{basedir}/foo': }
      concat::fragment { '1':
        target  => '#{basedir}/foo',
        content => 'string1',
        order   => '01',
      }
      concat::fragment { '2':
        target  => '#{basedir}/foo',
        content => 'string2',
        order   => '02'
      }
      concat::fragment { '3':
        target  => '#{basedir}/foo',
        content => 'string3',
        order   => '03',
      }
    EOS

    it 'applies the manifest twice with no stderr' do
      apply_manifest(pp, :catch_failures => true)
      apply_manifest(pp, :catch_changes => true)
    end

    describe file("#{basedir}/foo") do
      it { should be_file }
      its(:content) { should match /string1string2string3/ }
    end
  end
end # concat::fragment order
