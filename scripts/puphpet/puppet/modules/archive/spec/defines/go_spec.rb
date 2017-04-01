require 'spec_helper'

describe 'archive::go' do
  let(:facts) { { osfamily: 'RedHat', puppetversion: '3.7.3' } }

  before do
    MockFunction.new('go_md5') do |f|
      f.stub.returns('0d4f4b4b039c10917cfc49f6f6be71e4')
    end
  end

  context 'go archive with defaults' do
    let(:title) { '/opt/app/example.zip' }
    let(:params) do
      {
        server: 'home.lan',
        port: '8081',
        url_path: 'go/example.zip',
        md5_url_path: 'go/example.zip/checksum',
        username: 'username',
        password: 'password'
      }
    end

    it do
      should contain_archive('/opt/app/example.zip').with(
        path: '/opt/app/example.zip',
        source: 'http://home.lan:8081/go/example.zip',
        checksum: '0d4f4b4b039c10917cfc49f6f6be71e4',
        checksum_type: 'md5'
      )
    end

    it do
      should contain_file('/opt/app/example.zip').with(
        owner: '0',
        group: '0',
        mode: '0640',
        require: 'Archive[/opt/app/example.zip]'
      )
    end
  end

  context 'go archive with path' do
    let(:title) { 'example.zip' }
    let(:params) do
      {
        archive_path: '/opt/app',
        server: 'home.lan',
        port: '8081',
        url_path: 'go/example.zip',
        md5_url_path: 'go/example.zip/checksum',
        username: 'username',
        password: 'password',
        owner: 'app',
        group: 'app',
        mode: '0400'
      }
    end

    it do
      should contain_archive('/opt/app/example.zip').with(
        path: '/opt/app/example.zip',
        source: 'http://home.lan:8081/go/example.zip',
        checksum: '0d4f4b4b039c10917cfc49f6f6be71e4',
        checksum_type: 'md5'
      )
    end

    it do
      should contain_file('/opt/app/example.zip').with(
        owner: 'app',
        group: 'app',
        mode: '0400',
        require: 'Archive[/opt/app/example.zip]'
      )
    end
  end
end
