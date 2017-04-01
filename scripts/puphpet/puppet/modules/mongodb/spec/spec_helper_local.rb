RSpec.configure do |config|
  config.mock_with :rspec
end

def with_debian_facts
  let :facts do
    {
      :lsbdistid       => 'Debian',
      :lsbdistcodename => 'jessie',
      :operatingsystem => 'Debian',
      :operatingsystemmajrelease => 8,
      :osfamily        => 'Debian',
      :root_home       => '/root',
    }
  end
end

def with_centos_facts
  let :facts do
    {
      :architecture           => 'x86_64',
      :operatingsystem        => 'CentOS',
      :operatingsystemrelease => '7.0',
      :osfamily               => 'RedHat',
      :root_home              => '/root',
    }
  end
end

def with_redhat_facts
  let :facts do
    {
      :architecture           => 'x86_64',
      :operatingsystem        => 'RedHat',
      :operatingsystemrelease => '7.0',
      :osfamily               => 'RedHat',
      :root_home              => '/root',
    }
  end
end
