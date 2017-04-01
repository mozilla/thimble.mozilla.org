require 'spec_helper'

describe 'apt::key' do
  let :pre_condition do
    'class { "apt": }'
  end

  let(:facts) { { :lsbdistid => 'Debian', :osfamily => 'Debian', :lsbdistcodename => 'wheezy', :puppetversion   => Puppet.version, } }

  GPG_KEY_ID = '47B320EB4C7C375AA9DAE1A01054B7A24BD6EC30'

  let :title do
    GPG_KEY_ID
  end

  describe 'normal operation' do
    describe 'default options' do
      it 'contains the apt_key' do
        is_expected.to contain_apt_key(title).with({
          :id      => title,
          :ensure  => 'present',
          :source  => nil,
          :server  => 'keyserver.ubuntu.com',
          :content => nil,
          :options => nil,
        })
      end
      it 'contains the apt_key present anchor' do
        is_expected.to contain_anchor("apt_key #{title} present")
      end
    end

    describe 'title and key =>' do
      let :title do
        'puppetlabs'
      end

      let :params do {
        :id => GPG_KEY_ID,
      } end

      it 'contains the apt_key' do
        is_expected.to contain_apt_key(title).with({
          :id      => GPG_KEY_ID,
          :ensure  => 'present',
          :source  => nil,
          :server  => 'keyserver.ubuntu.com',
          :content => nil,
          :options => nil,
        })
      end
      it 'contains the apt_key present anchor' do
        is_expected.to contain_anchor("apt_key #{GPG_KEY_ID} present")
      end
    end

    describe 'ensure => absent' do
      let :params do {
        :ensure => 'absent',
      } end

      it 'contains the apt_key' do
        is_expected.to contain_apt_key(title).with({
          :id        => title,
          :ensure    => 'absent',
          :source    => nil,
          :server    => 'keyserver.ubuntu.com',
          :content   => nil,
          :keyserver => nil,
        })
      end
      it 'contains the apt_key absent anchor' do
        is_expected.to contain_anchor("apt_key #{title} absent")
      end
    end

    describe 'set a bunch of things!' do
      let :params do {
        :content => 'GPG key content',
        :source  => 'http://apt.puppetlabs.com/pubkey.gpg',
        :server  => 'pgp.mit.edu',
        :options => 'debug',
      } end

      it 'contains the apt_key' do
        is_expected.to contain_apt_key(title).with({
          :id      => title,
          :ensure  => 'present',
          :source  => 'http://apt.puppetlabs.com/pubkey.gpg',
          :server  => 'pgp.mit.edu',
          :content => params[:content],
          :options => 'debug',
        })
      end
      it 'contains the apt_key present anchor' do
        is_expected.to contain_anchor("apt_key #{title} present")
      end
    end

    context "domain with dash" do
      let(:params) do{
        :server => 'p-gp.m-it.edu',
      } end
      it 'contains the apt_key' do
        is_expected.to contain_apt_key(title).with({
          :id        => title,
          :server => 'p-gp.m-it.edu',
        })
      end
    end

    context "url" do
      let :params do
        {
          :server => 'hkp://pgp.mit.edu',
        }
      end
      it 'contains the apt_key' do
        is_expected.to contain_apt_key(title).with({
          :id        => title,
          :server => 'hkp://pgp.mit.edu',
        })
      end
    end
    context "url with port number" do
      let :params do
        {
          :server => 'hkp://pgp.mit.edu:80',
        }
      end
      it 'contains the apt_key' do
        is_expected.to contain_apt_key(title).with({
          :id        => title,
          :server => 'hkp://pgp.mit.edu:80',
        })
      end
    end
  end

  describe 'validation' do
    context "domain begin with dash" do
      let(:params) do{
        :server => '-pgp.mit.edu',
      } end
      it 'fails' do
        expect { subject.call } .to raise_error(/does not match/)
      end
    end

    context "domain begin with dot" do
      let(:params) do{
        :server => '.pgp.mit.edu',
      } end
      it 'fails' do
        expect { subject.call } .to raise_error(/does not match/)
      end
    end

    context "domain end with dot" do
      let(:params) do{
        :server => "pgp.mit.edu.",
      } end
      it 'fails' do
        expect { subject.call } .to raise_error(/does not match/)
      end
    end
    context "exceed character url" do
      let :params do
        {
          :server => 'hkp://pgpiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii.mit.edu'
        }
      end
      it 'fails' do
        expect { subject.call }.to raise_error(/does not match/)
      end
    end
    context "incorrect port number url" do
      let :params do
        {
          :server => 'hkp://pgp.mit.edu:8008080'
        }
      end
      it 'fails' do
        expect { subject.call }.to raise_error(/does not match/)
      end
    end
    context "incorrect protocol for  url" do
      let :params do
        {
          :server => 'abc://pgp.mit.edu:80'
        }
      end
      it 'fails' do
        expect { subject.call }.to raise_error(/does not match/)
      end
    end
    context "missing port number url" do
      let :params do
        {
          :server => 'hkp://pgp.mit.edu:'
        }
      end
      it 'fails' do
        expect { subject.call }.to raise_error(/does not match/)
      end
    end
    context "url ending with a dot" do
      let :params do
        {
          :server => 'hkp://pgp.mit.edu.'
        }
      end
      it 'fails' do
        expect { subject.call }.to raise_error(/does not match/)
      end
    end
    context "url begin with a dash" do
      let(:params) do{
        :server => "hkp://-pgp.mit.edu",
      } end
      it 'fails' do
        expect { subject.call }.to raise_error(/does not match/)
      end
    end
    context 'invalid key' do
      let :title do
        'Out of rum. Why? Why are we out of rum?'
      end
      it 'fails' do
        expect { subject.call }.to raise_error(/does not match/)
      end
    end

    context 'invalid source' do
      let :params do {
        :source => 'afp://puppetlabs.com/key.gpg',
      } end
      it 'fails' do
        expect { subject.call }.to raise_error(/does not match/)
      end
    end

    context 'invalid content' do
      let :params do {
        :content => [],
      } end
      it 'fails' do
        expect { subject.call }.to raise_error(/is not a string/)
      end
    end

    context 'invalid server' do
      let :params do {
        :server => 'two bottles of rum',
      } end
      it 'fails' do
        expect { subject.call }.to raise_error(/does not match/)
      end
    end

    context 'invalid options' do
      let :params do {
        :options => {},
      } end
      it 'fails' do
        expect { subject.call }.to raise_error(/is not a string/)
      end
    end

    context 'invalid ensure' do
      %w(foo aabsent absenta apresent presenta).each do |param|
        let :params do
          {
            :ensure => param,
          }
          end
        it 'fails' do
          expect { subject.call }.to raise_error(/does not match/)
        end
      end
    end

    describe 'duplication' do
      context 'two apt::key resources for same key, different titles' do
        let :pre_condition do
          "class { 'apt': }
          apt::key { 'duplicate': id => '#{title}', }"
        end

        it 'contains two apt::key resources' do
          is_expected.to contain_apt__key('duplicate').with({
            :id     => title,
            :ensure => 'present',
          })
          is_expected.to contain_apt__key(title).with({
            :id     => title,
            :ensure => 'present',
          })
        end

        it 'contains only a single apt_key' do
          is_expected.to contain_apt_key('duplicate').with({
            :id      => title,
            :ensure  => 'present',
            :source  => nil,
            :server  => 'keyserver.ubuntu.com',
            :content => nil,
            :options => nil,
          })
          is_expected.not_to contain_apt_key(title)
        end
      end

      context 'two apt::key resources, different ensure' do
        let :pre_condition do
          "class { 'apt': }
          apt::key { 'duplicate': id => '#{title}', ensure => 'absent', }"
        end
        it 'informs the user of the impossibility' do
          expect { subject.call }.to raise_error(/already ensured as absent/)
        end
      end
    end
  end
end
