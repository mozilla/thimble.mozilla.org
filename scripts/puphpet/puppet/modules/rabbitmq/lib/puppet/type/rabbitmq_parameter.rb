Puppet::Type.newtype(:rabbitmq_parameter) do

  desc 'Type for managing rabbitmq parameters'

  ensurable do
    defaultto(:present)
    newvalue(:present) do
      provider.create
    end
    newvalue(:absent) do
      provider.destroy
    end
  end

  autorequire(:service) { 'rabbitmq-server' }

  validate do
    fail('component_name parameter is required.') if self[:ensure] == :present and self[:component_name].nil?
    fail('value parameter is required.') if self[:ensure] == :present and self[:value].nil?
  end

  newparam(:name, :namevar => true) do
    desc 'combination of name@vhost to set parameter for'
    newvalues(/^\S+@\S+$/)
  end

  newproperty(:component_name) do
    desc 'The component_name to use when setting parameter, eg: shovel or federation'
    validate do |value|
      resource.validate_component_name(value)
    end
  end

  newproperty(:value) do
    desc 'A hash of values to use with the component name you are setting'
    validate do |value|
      resource.validate_value(value)
    end
    munge do |value|
      resource.munge_value(value)
    end
  end

  autorequire(:rabbitmq_vhost) do
    [self[:name].split('@')[1]]
  end

  def validate_component_name(value)
    if value.empty?
      raise ArgumentError, "component_name must be defined"
    end
  end

  def validate_value(value)
    unless [Hash].include?(value.class)
      raise ArgumentError, "Invalid value"
    end
    value.each do |k,v|
      unless [String, TrueClass, FalseClass].include?(v.class)
        raise ArgumentError, "Invalid value"
      end
    end
  end

  def munge_value(value)
    value.each do |k,v|
      if (v =~ /\A[-+]?[0-9]+\z/)
        value[k] = v.to_i
      end
    end
    value
  end
end
