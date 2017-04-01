require 'spec_helper_acceptance'

describe 'postgresql::server::recovery', :unless => UNSUPPORTED_PLATFORMS.include?(fact('osfamily')) do
  describe 'should manage recovery' do
    after(:all) do
      pp = <<-EOS.unindent
        file { '/tmp/recovery.conf':
          ensure => absent,
        }
      EOS

      apply_manifest(pp, :catch_failures => true)
    end

    it 'adds conf file' do
      pp = <<-EOS.unindent
        class { 'postgresql::globals':
          recovery_conf_path => '/tmp/recovery.conf',
          manage_recovery_conf => true,
        }

        class { 'postgresql::server': }

        # Create a recovery.conf file
        postgresql::server::recovery { "recovery.conf":
          restore_command          => 'restore_command',
          recovery_target_timeline => 'recovery_target_timeline',
        }
      EOS

      apply_manifest(pp, :catch_failures => true)
      apply_manifest(pp, :catch_changes => true)
    end

    describe file('/tmp/recovery.conf') do
      it { is_expected.to be_file }
      it { is_expected.to contain /restore_command = 'restore_command'/ }
      it { is_expected.to contain /recovery_target_timeline = 'recovery_target_timeline'/ }
    end
  end

  describe 'should not manage recovery' do
    it 'does not add conf file' do
      pp = <<-EOS.unindent
        class { 'postgresql::globals':
          manage_recovery_conf => false,
        }

        class { 'postgresql::server': }
      EOS

      apply_manifest(pp, :catch_failures => true)
      apply_manifest(pp, :catch_changes => true)
    end

    describe file('/tmp/recovery.conf') do
      it { is_expected.not_to be_file }
    end
  end
end

