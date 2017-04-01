require "shellwords"

Puppet::Type.type(:git_config).provide(:git_config) do

  mk_resource_methods

  def value
    require 'etc'
    user    = @property_hash[:user]    = @resource[:user]
    key     = @property_hash[:key]     = @resource[:key]
    section = @property_hash[:section] = @resource[:section]
    scope   = @property_hash[:scope]   = @resource[:scope]
    home    = Etc.getpwnam(user)[:dir]

    # Backwards compatibility with deprecated $section parameter.
    if section && !section.empty?
      key = "#{section}.#{key}"
    end

    current = Puppet::Util::Execution.execute(
      "cd / ; git config --#{scope} --get #{key}",
      :uid => user,
      :failonfail => false,
      :combine => true,
      :custom_environment => { 'HOME' => home }
    )
    @property_hash[:value] = current.strip
    @property_hash[:value]
  end

  def value=(value)
    require 'etc'
    user    = @resource[:user]
    key     = @resource[:key]
    section = @resource[:section]
    scope   = @resource[:scope]
    home    = Etc.getpwnam(user)[:dir]

    # Backwards compatibility with deprecated $section parameter.
    if section && !section.empty?
      key = "#{section}.#{key}"
    end

    Puppet::Util::Execution.execute(
      "cd / ; git config --#{scope} #{key} #{value.shellescape}",
      :uid => user,
      :failonfail => true,
      :combine => true,
      :custom_environment => { 'HOME' => home }
    )
  end

end
