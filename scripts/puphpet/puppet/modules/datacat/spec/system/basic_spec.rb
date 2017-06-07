require 'spec_helper_system'

describe 'basic tests:' do
  # Using puppet_apply as a subject
  context puppet_apply 'notice("foo")' do
    its(:stdout) { should =~ /foo/ }
    its(:stderr) { should be_empty }
    its(:exit_code) { should be_zero }
  end

  # Using puppet_apply as a helper
  it 'my class should work with no errors' do
    pp = <<-EOS
      datacat { "/tmp/demo1":
        template_body => "<% @data.keys.sort.each do |k| %><%= k %>: <%= @data[k] %>, <% end %>",
      }

      datacat_fragment { "foo":
        target => '/tmp/demo1',
        data => { foo => "one" },
      }

      datacat_fragment { "bar":
        target => '/tmp/demo1',
        data => { bar => "two" },
      }

      exec { '/bin/echo I have changed':
         refreshonly => true,
         subscribe => Datacat["/tmp/demo1"],
      }
    EOS

    # Run it twice and test for idempotency
    puppet_apply(pp) do |r|
      r.exit_code.should_not == 1
      r.refresh
      r.exit_code.should be_zero
    end

    shell('cat /tmp/demo1') do |r|
      r.stdout.should =~ /^bar: two, foo: one/
    end
  end

  it 'should run the example from the documentation via a master' do
    shell 'sudo sh -c "echo include demo3 > /etc/puppet/manifests/site.pp"'
    puppet_agent(:debug => true) do |r|
      r.exit_code.should_not == 1
      r.refresh
      r.exit_code.should be_zero
    end

    shell('cat /tmp/demo3') do |r|
      r.stdout.should =~ /\s+name device\n\s+members foo-ilo.example.com,foo.example.com/
    end
  end
end
