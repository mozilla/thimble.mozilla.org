Puppet::Type.newtype(:elasticsearch_shield_user_roles) do
  desc "Type to model Elasticsearch shield user roles."

  ensurable do
    defaultvalues
    defaultto :present
  end

  newparam(:name, :namevar => true) do
    desc 'User name.'
  end

  newproperty(:roles, :array_matching => :all) do
    desc 'Array of roles that the user should belong to.'
    def insync? is
      is.sort == should.sort
    end
  end

  autorequire(:elasticsearch_shield_user) do
    self[:name]
  end
end
