require 'spec_helper_acceptance'

describe 'sysctl class' do

  context 'basic config' do
    # Using puppet_apply as a helper
    it 'should work with no errors' do

      # Hard to find a sysctl config that works on both OSX and Linux...
      if fact('osfamily') =~ /Darwin/
        pp = <<-EOS
        sysctl { 'net.inet.tcp.win_scale_factor':
        ensure    => 'present',
          value     => '8',
        }
        EOS
      else
        pp = <<-EOS
        sysctl { 'net.ipv4.ip_local_port_range':
        ensure    => 'present',
          permanent => 'yes',
          value     => '32768 61000',
        }
        EOS
      end

      # Run it twice and test for idempotency
      apply_manifest(pp, :catch_failures => true)
      apply_manifest(pp, :catch_changes  => true)
    end
  end
end
