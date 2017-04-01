require 'spec_helper'
describe 'resolv_conf' do
  let :default_params do
    {
      searchpath: 'example.com',
      nameservers: ['192.168.0.1', '192.168.1.1', '192.168.2.1'],
      domainname: 'domain.tld'
    }
  end

  [
    {
      searchpath: 'example.com',
      nameservers: ['192.168.0.1', '192.168.1.1', '192.168.2.1'],
      domainname: 'example.com'
    },
    {
      searchpath: ['example.com', 'example.de'],
      nameservers: ['192.168.0.1', '192.168.1.1', '192.168.2.1'],
      domainname: 'example.com',
      options: ['timeout:2', 'attempts:3']
    },
    {
      searchpath: 'example.com',
      nameservers: ['192.168.0.1', '192.168.1.1', '192.168.2.1'],
      domainname: 'example.com',
      options: ['timeout:2', 'attempts:3']
    }
  ].each do |param_set|
    describe 'when setting searchpath and dominname' do
      let :param_hash do
        default_params.merge(param_set)
      end

      let :params do
        param_set
      end

      %w(Debian Redhat).each do |osfamily|
        let :facts do
          {
            osfamily: osfamily,
            domain: 'example.com'
          }
        end

        describe "on supported osfamily: #{osfamily}" do
          it 'fails to compile' do
            expect { is_expected.to compile }.to raise_error(%r{domainname and searchpath are mutually exclusive parameters})
          end
        end
      end
    end
  end

  let :default_params do
    {
      searchpath: 'example.com',
      nameservers: ['192.168.0.1', '192.168.1.1', '192.168.2.1']
    }
  end

  [
    {
      searchpath: 'example.com',
      nameservers: ['192.168.0.1', '192.168.1.1', '192.168.2.1']
    },
    {
      searchpath: ['example.com', 'example.de'],
      nameservers: ['192.168.0.1', '192.168.1.1', '192.168.2.1']
    },
    {
      searchpath: 'example.com',
      nameservers: ['192.168.0.1', '192.168.1.1', '192.168.2.1'],
      options: ['timeout:2', 'attempts:3']
    }
  ].each do |param_set|
    describe 'when setting searchpath without domainname' do
      let :param_hash do
        default_params.merge(param_set)
      end

      let :params do
        param_set
      end

      %w(Debian Redhat).each do |osfamily|
        let :facts do
          {
            osfamily: osfamily,
            domain: 'example.com'
          }
        end

        describe "on supported osfamily: #{osfamily}" do
          it { is_expected.to contain_class('resolv_conf::params') }

          it do
            is_expected.to contain_file('/etc/resolv.conf').with(
              'ensure'  => 'file',
              'owner'   => 'root',
              'group'   => 0,
              'mode'    => '0644'
            )
          end

          it 'compiles the template based on the class parameters' do
            content = param_value(
              catalogue,
              'file',
              '/etc/resolv.conf',
              'content'
            )

            expected_lines = []
            if param_hash[:searchpath].empty?
              expected_lines.push("domain #{param_hash[:domainname]}")
            elsif param_hash[:searchpath].is_a?(Array)
              expected_lines.push('search ' + param_hash[:searchpath].join(' '))
            else
              expected_lines.push("search #{param_hash[:searchpath]}")
            end

            param_hash[:nameservers].each do |ns|
              expected_lines.push("nameserver #{ns}")
            end

            if param_hash[:options] && !param_hash[:options].empty?
              expected_lines.push('options ' + param_hash[:options].join(' '))
            end
            (content.split("\n") & expected_lines).should =~ expected_lines
          end
        end
      end
    end
  end

  let :default_params do
    {
      nameservers: ['192.168.0.1', '192.168.1.1', '192.168.2.1'],
      domainname: 'domain.tld'
    }
  end

  [
    {
      nameservers: ['192.168.0.1', '192.168.1.1', '192.168.2.1'],
      domainname: 'example.com'
    },
    {
      nameservers: ['192.168.0.1', '192.168.1.1', '192.168.2.1'],
      domainname: 'example.com',
      options: ['timeout:2', 'attempts:3']
    }
  ].each do |param_set|
    describe 'when setting domainname without searchpath' do
      let :param_hash do
        default_params.merge(param_set)
      end

      let :params do
        param_set
      end

      %w(Debian Redhat).each do |osfamily|
        let :facts do
          {
            osfamily: osfamily,
            domain: 'example.com'
          }
        end

        describe "on supported osfamily: #{osfamily}" do
          it { is_expected.to contain_class('resolv_conf::params') }

          it do
            is_expected.to contain_file('/etc/resolv.conf').with(
              'ensure'  => 'file',
              'owner'   => 'root',
              'group'   => 0,
              'mode'    => '0644'
            )
          end

          it 'compiles the template based on the class parameters' do
            content = param_value(
              catalogue,
              'file',
              '/etc/resolv.conf',
              'content'
            )
            expected_lines = [
              "domain #{param_hash[:domainname]}"
            ]

            param_hash[:nameservers].each do |ns|
              expected_lines.push("nameserver #{ns}")
            end

            if param_hash[:options] && !param_hash[:options].empty?
              expected_lines.push('options ' + param_hash[:options].join(' '))
            end
            (content.split("\n") & expected_lines).should =~ expected_lines
          end
        end
      end
    end
  end

  let :default_params do
    {
      nameservers: ['192.168.0.1', '192.168.1.1', '192.168.2.1']
    }
  end

  [
    {
      nameservers: ['192.168.0.1', '192.168.1.1', '192.168.2.1']
    },
    {
      nameservers: ['192.168.0.1', '192.168.1.1', '192.168.2.1'],
      options: ['timeout:2', 'attempts:3']
    },
    {
      nameservers: ['192.168.0.1', '192.168.1.1', '192.168.2.1'],
      options: ['timeout:2', 'attempts:3']
    }
  ].each do |param_set|
    describe 'when setting neither searchpath nor domainname' do
      let :param_hash do
        default_params.merge(param_set)
      end

      let :params do
        param_set
      end

      %w(Debian Redhat).each do |osfamily|
        let :facts do
          {
            osfamily: osfamily,
            domain: 'example.com'
          }
        end

        describe "on supported osfamily: #{osfamily}" do
          it { is_expected.to contain_class('resolv_conf::params') }

          it do
            is_expected.to contain_file('/etc/resolv.conf').with(
              'ensure'  => 'file',
              'owner'   => 'root',
              'group'   => 0,
              'mode'    => '0644'
            )
          end

          it 'compiles the template based on the class parameters' do
            content = param_value(
              catalogue,
              'file',
              '/etc/resolv.conf',
              'content'
            )
            expected_lines = [
              "domain #{facts[:domain]}"
            ]

            param_hash[:nameservers].each do |ns|
              expected_lines.push("nameserver #{ns}")
            end

            if param_hash[:options] && !param_hash[:options].empty?
              expected_lines.push('options ' + param_hash[:options].join(' '))
            end
            (content.split("\n") & expected_lines).should =~ expected_lines
          end
        end
      end
    end
  end
end
