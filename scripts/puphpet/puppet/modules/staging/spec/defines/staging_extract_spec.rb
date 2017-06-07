require 'spec_helper'
describe 'staging::extract', :type => :define do
  # forcing a more sane caller_module_name to match real usage.
  let(:facts) do
    {
      :osfamily => 'RedHat',
      :path => '/usr/local/bin:/usr/bin:/bin'
    }
  end

  describe 'when deploying tar.gz' do
    let(:title) { 'sample.tar.gz' }
    let(:params) { { :target => '/opt' } }

    it do
      should contain_file('/opt/staging')
      should contain_exec('extract sample.tar.gz').with(:command => 'tar xzf /opt/staging//sample.tar.gz',
                                                        :path => '/usr/local/bin:/usr/bin:/bin',
                                                        :cwd => '/opt',
                                                        :creates => '/opt/sample')
    end
  end

  describe 'when deploying tar.gz with strip' do
    let(:title) { 'sample.tar.gz' }
    let(:params) do
      { :target => '/opt',
        :strip => 1 }
    end

    it do
      should contain_file('/opt/staging')
      should contain_exec('extract sample.tar.gz').with(:command => 'tar xzf /opt/staging//sample.tar.gz --strip=1',
                                                        :path => '/usr/local/bin:/usr/bin:/bin',
                                                        :cwd => '/opt',
                                                        :creates => '/opt/sample')
    end
  end

  describe 'when deploying tbz2' do
    let(:title) { 'sample.tbz2' }
    let(:params) { { :target => '/opt' } }

    it do
      should contain_file('/opt/staging')
      should contain_exec('extract sample.tbz2').with(:command => 'tar xjf /opt/staging//sample.tbz2',
                                                      :path => '/usr/local/bin:/usr/bin:/bin',
                                                      :cwd => '/opt',
                                                      :creates => '/opt/sample')
    end
  end

  describe 'when deploying zip' do
    let(:title) { 'sample.zip' }
    let(:params) { { :target => '/opt' } }

    it do
      should contain_file('/opt/staging')
      should contain_exec('extract sample.zip').with(:command => 'unzip  /opt/staging//sample.zip',
                                                     :path => '/usr/local/bin:/usr/bin:/bin',
                                                     :cwd => '/opt',
                                                     :creates => '/opt/sample')
    end
  end

  describe 'when deploying zip with unzip_opts' do
    let(:title) { 'sample.zip' }
    let(:params) do
      {
        :target => '/opt',
        :unzip_opts => '-o -f'
      }
    end
    it do
      should contain_file('/opt/staging')
      should contain_exec('extract sample.zip').with(:command => 'unzip -o -f /opt/staging//sample.zip',
                                                     :path => '/usr/local/bin:/usr/bin:/bin',
                                                     :cwd => '/opt',
                                                     :creates => '/opt/sample')
    end
  end

  describe 'when deploying zip with strip (noop)' do
    let(:title) { 'sample.zip' }
    let(:params) do
      {
        :target => '/opt',
        :strip => 1
      }
    end

    it do
      should contain_file('/opt/staging')
      should contain_exec('extract sample.zip').with(:command => 'unzip  /opt/staging//sample.zip',
                                                     :path => '/usr/local/bin:/usr/bin:/bin',
                                                     :cwd => '/opt',
                                                     :creates => '/opt/sample')
    end
  end

  describe 'when deploying war' do
    let(:title) { 'sample.war' }
    let(:params) { { :target => '/opt' } }
    it do
      should contain_file('/opt/staging')
      should contain_exec('extract sample.war').with(:command => 'jar xf /opt/staging//sample.war',
                                                     :path => '/usr/local/bin:/usr/bin:/bin',
                                                     :cwd => '/opt',
                                                     :creates => '/opt/sample')
    end
  end

  describe 'when deploying war with strip (noop) and unzip_opts (noop)' do
    let(:title) { 'sample.war' }
    let(:params) do
      {
        :target => '/opt',
        :strip => 1,
        :unzip_opts => '-o -f'
      }
    end
    it do
      should contain_file('/opt/staging')
      should contain_exec('extract sample.war').with(:command => 'jar xf /opt/staging//sample.war',
                                                     :path => '/usr/local/bin:/usr/bin:/bin',
                                                     :cwd => '/opt',
                                                     :creates => '/opt/sample')
    end
  end

  describe 'when deploying deb on a Debian family system' do
    let(:facts) do
      {
        :osfamily => 'Debian',
        :path => '/usr/local/bin:/usr/bin:/bin'
      }
    end
    let(:title) { 'sample.deb' }
    let(:params) { { :target => '/opt' } }

    it do
      should contain_file('/opt/staging')
      should contain_exec('extract sample.deb').with(:command => 'dpkg --extract /opt/staging//sample.deb .',
                                                     :path => '/usr/local/bin:/usr/bin:/bin',
                                                     :cwd => '/opt',
                                                     :creates => '/opt/sample')
    end
  end

  describe 'when deploying deb on a non-Debian family system' do
    let(:title) { 'sample.deb' }
    let(:params) do
      { :target => '/opt' }
    end
    it 'fails' do
      should compile.and_raise_error(%r{The .deb filetype is only supported on Debian family systems.})
    end
  end

  describe 'when deploying unknown' do
    let(:title) { 'sample.zzz' }
    let(:params) { { :target => '/opt' } }

    it { expect { should contain_exec('exec sample.zzz') }.to raise_error(Puppet::Error) }
  end
end
