require 'json'
require 'puppet/util/package'

require File.expand_path(File.join(File.dirname(__FILE__), '..', 'rabbitmqctl'))
Puppet::Type.type(:rabbitmq_parameter).provide(:rabbitmqctl, :parent => Puppet::Provider::Rabbitmqctl) do

  defaultfor :feature => :posix

  # cache parameters
  def self.parameters(name, vhost)
    @parameters = {} unless @parameters
    unless @parameters[vhost]
      @parameters[vhost] = {}
      self.run_with_retries {
        rabbitmqctl('list_parameters', '-q', '-p', vhost)
      }.split(/\n/).each do |line|
        if line =~ /^(\S+)\s+(\S+)\s+(\S+)$/
          @parameters[vhost][$2] = {
            :component_name    => $1,
            :value => JSON.parse($3),
          }
        else
          raise Puppet::Error, "cannot parse line from list_parameter:#{line}"
        end
      end
    end
    @parameters[vhost][name]
  end

  def parameters(name, vhost)
    self.class.parameters(vhost, name)
  end

  def should_parameter
    @should_parameter ||= resource[:name].rpartition('@').first
  end

  def should_vhost
    @should_vhost ||= resource[:name].rpartition('@').last
  end

  def create
    set_parameter
  end

  def destroy
    rabbitmqctl('clear_parameter', '-p', should_vhost, 'shovel', should_parameter)
  end

  def exists?
    parameters(should_vhost, should_parameter)
  end

  def component_name
    parameters(should_vhost, should_parameter)[:component_name]
  end

  def component_name=(component_name)
    set_parameter
  end

  def value
    parameters(should_vhost, should_parameter)[:value]
  end

  def value=(value)
    set_parameter
  end

  def set_parameter
    unless @set_parameter
      @set_parameter = true
      resource[:value] ||= value
      resource[:component_name]    ||= component_name
      rabbitmqctl('set_parameter',
        '-p', should_vhost,
        resource[:component_name],
        should_parameter,
        resource[:value].to_json
      )
    end
  end

end
