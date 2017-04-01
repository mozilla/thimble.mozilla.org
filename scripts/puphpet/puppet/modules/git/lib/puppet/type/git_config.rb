Puppet::Type.newtype(:git_config) do

  desc <<-DOC
  Used to configure git
  === Examples


   git_config { 'user.name':
     value => 'John Doe',
   }

   git_config { 'user.email':
     value => 'john.doe@example.com',
   }

   git_config { 'user.name':
     value   => 'Mike Color',
     user    => 'vagrant',
     require => Class['git'],
   }

   git_config { 'http.sslCAInfo':
     value   => $companyCAroot,
     user    => 'root',
     scope   => 'system',
     require => Company::Certificate['companyCAroot'],
   }
  DOC

  validate do
    fail('it is required to pass "value"') if self[:value].nil? || self[:value].empty? || self[:value] == :absent
    warning('Parameter `section` is deprecated, supply the full option name (e.g. "user.email") in the `key` parameter') if
      self[:section] && !self[:section].empty?
  end

  newparam(:name, :namevar => true) do
    desc "The name of the config"
  end

  newproperty(:value) do
    desc "The config value. Example Mike Color or john.doe@example.com"
  end

  newparam(:user) do
    desc "The user for which the config will be set. Default value: root"
    defaultto "root"
  end

  newparam(:key) do
    desc "The configuration key. Example: user.email."
  end

  autorequire(:user) do
    self[:user]
  end

  newparam(:section) do
    desc "Deprecated: the configuration section. For example, to set user.email, use section => \"user\", key => \"email\"."
    defaultto ""
  end

  newparam(:scope) do
    desc "The scope of the configuration, can be system or global. Default value: global"
    defaultto "global"
  end

end
