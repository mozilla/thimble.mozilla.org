require 'spec_helper'

describe 'redis' do
  context 'on FreeBSD' do
    let(:facts) {
      freebsd_facts
    }

    context 'should set FreeBSD specific values' do
      it { should contain_file('/usr/local/etc/redis.conf.puppet').with('content' => /dir \/var\/db\/redis\//) }
      it { should contain_file('/usr/local/etc/redis.conf.puppet').with('content' => /pidfile \/var\/run\/redis\/redis.pid/) }
    end
  end

end
