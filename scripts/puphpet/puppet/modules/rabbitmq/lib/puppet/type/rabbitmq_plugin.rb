Puppet::Type.newtype(:rabbitmq_plugin) do
  desc 'manages rabbitmq plugins'

  ensurable do
    defaultto(:present)
    newvalue(:present) do
      provider.create
    end
    newvalue(:absent) do
      provider.destroy
    end
  end

  newparam(:name, :namevar => true) do
    'name of the plugin to enable'
    newvalues(/^\S+$/)
  end

  newparam(:umask) do
    desc "Sets the octal umask to be used while creating this resource"
    defaultto '0022'
    munge do |value|
      if value =~ /^0?[0-7]{1,3}$/
        return value.to_i(8)
      else
        raise Puppet::Error, "The umask specification is invalid: #{value.inspect}"
      end
    end
  end

end
