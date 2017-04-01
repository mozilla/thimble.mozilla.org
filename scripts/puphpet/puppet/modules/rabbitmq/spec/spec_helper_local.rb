RSpec.shared_context "default facts" do
  let(:facts) { { :puppetversion => Puppet.version, } }
end

RSpec.configure do |rspec|
  rspec.include_context "default facts"
end

def with_debian_facts
  let :facts do
    super().merge({
      :lsbdistcodename  => 'squeeze',
      :lsbdistid        => 'Debian',
      :osfamily         => 'Debian',
      :staging_http_get => '',
    })
  end
end

def with_openbsd_facts
  # operatingsystemmajrelease is too broad
  # operatingsystemrelease may contain X.X-current
  # or other prefixes
  let :facts do
    super().merge({
      :kernelversion             => '5.9',
      :osfamily                  => 'OpenBSD',
      :staging_http_get          => '',
    })
  end
end

def with_redhat_facts
  let :facts do
    super().merge({
      :operatingsystemmajrelease => '7',
      :osfamily                  => 'Redhat',
      :staging_http_get          => '',
    })
  end
end
