require 'spec_helper'

describe 'postgresql::server::recovery', :type => :define do
  let :facts do
    {
      :osfamily => 'Debian',
      :operatingsystem => 'Debian',
      :operatingsystemrelease => '6.0',
      :kernel => 'Linux',
      :concat_basedir => tmpfilename('recovery'),
      :id => 'root',
      :path => '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
    }
  end
  let :title do
    'test'
  end
  let :target do
    tmpfilename('recovery')
  end

  context 'managing recovery' do
    let :pre_condition do
      <<-EOS
        class { 'postgresql::globals':
          manage_recovery_conf => true,
        }
        class { 'postgresql::server': }
      EOS
    end

    let :params do
      {
        :restore_command            => 'restore_command',
        :recovery_target_timeline   => 'recovery_target_timeline',
      }
    end
    it do
      is_expected.to contain_concat__fragment('recovery.conf').with({
        :content => /restore_command = 'restore_command'[\n]+recovery_target_timeline = 'recovery_target_timeline'/
      })
    end
  end
  context 'not managing recovery' do
    let :pre_condition do
      <<-EOS
        class { 'postgresql::globals':
          manage_recovery_conf => false,
        }
        class { 'postgresql::server': }
      EOS
    end
    let :params do
      {
          :restore_command => '',
      }
    end
    it 'should fail because $manage_recovery_conf is false' do
      expect { catalogue }.to raise_error(Puppet::Error,
                                      /postgresql::server::manage_recovery_conf has been disabled/)
    end
  end
  context 'not managing recovery, missing param' do
    let :pre_condition do
      <<-EOS
        class { 'postgresql::globals':
          manage_recovery_conf => true,
        }
        class { 'postgresql::server': }
      EOS
    end
    it 'should fail because no param set' do
      expect { catalogue }.to raise_error(Puppet::Error,
                                      /postgresql::server::recovery use this resource but do not pass a parameter will avoid creating the recovery.conf, because it makes no sense./)
    end
  end

  context 'managing recovery with all params' do
    let :pre_condition do
      <<-EOS
        class { 'postgresql::globals':
          manage_recovery_conf => true,
        }
        class { 'postgresql::server': }
      EOS
    end

    let :params do
      {
          :restore_command            => 'restore_command',
          :archive_cleanup_command    => 'archive_cleanup_command',
          :recovery_end_command       => 'recovery_end_command',
          :recovery_target_name       => 'recovery_target_name',
          :recovery_target_time       => 'recovery_target_time',
          :recovery_target_xid        => 'recovery_target_xid',
          :recovery_target_inclusive  => true,
          :recovery_target            => 'recovery_target',
          :recovery_target_timeline   => 'recovery_target_timeline',
          :pause_at_recovery_target   => true,
          :standby_mode               => 'on',
          :primary_conninfo           => 'primary_conninfo',
          :primary_slot_name          => 'primary_slot_name',
          :trigger_file               => 'trigger_file',
          :recovery_min_apply_delay   => 0,
      }
    end
    it do
      is_expected.to contain_concat__fragment('recovery.conf').with({
          :content => /restore_command = 'restore_command'[\n]+archive_cleanup_command = 'archive_cleanup_command'[\n]+recovery_end_command = 'recovery_end_command'[\n]+recovery_target_name = 'recovery_target_name'[\n]+recovery_target_time = 'recovery_target_time'[\n]+recovery_target_xid = 'recovery_target_xid'[\n]+recovery_target_inclusive = true[\n]+recovery_target = 'recovery_target'[\n]+recovery_target_timeline = 'recovery_target_timeline'[\n]+pause_at_recovery_target = true[\n]+standby_mode = on[\n]+primary_conninfo = 'primary_conninfo'[\n]+primary_slot_name = 'primary_slot_name'[\n]+trigger_file = 'trigger_file'[\n]+recovery_min_apply_delay = 0[\n]+/
      })
    end
  end
end
