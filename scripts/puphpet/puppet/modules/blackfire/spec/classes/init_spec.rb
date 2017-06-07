require 'spec_helper'
describe 'blackfire' do

  on_supported_os.each do |os, facts|
    context "on #{os}" do
      let(:facts) { facts }

      context 'with default parameters' do
        it do
          expect {
            should compile
          }.to raise_error(/server_id and server_token are required./)
        end
      end

      context 'with minimum parameters (server id and token)' do
        let(:params) do
          {
            :server_id => 'foo',
            :server_token => 'bar',
          }
        end

        context 'with minimum set of parameters' do
          it { should compile }
          it { should contain_class('blackfire') }
          it { should contain_class('blackfire::repo') }
          it { should contain_class('blackfire::agent') }
          it { should contain_class('blackfire::php') }
        end

        context 'agent package' do
          it { should contain_package('blackfire-agent').with(:ensure => 'latest') }
        end
        
        context 'agent configuration' do
          it { should contain_ini_setting('server-id').with(
            :path => '/etc/blackfire/agent',
            :value => 'foo'
          )}
          it { should contain_ini_setting('server-token').with(
            :path => '/etc/blackfire/agent',
            :value => 'bar'
          )}
        end
        
        context 'agent service' do
          it { should contain_service('blackfire-agent').with(:ensure => 'running') }
        end
        
        context 'probe package' do
          it { should contain_package('blackfire-php').with(:ensure => 'latest') }
        end

        context 'probe configuration' do
          it { should contain_ini_setting('blackfire.server_id').with(
            :value => 'foo'
          )}
          it { should contain_ini_setting('blackfire.server_token').with(
            :value => 'bar'
          )}
        end
      end

    end
  end

end
