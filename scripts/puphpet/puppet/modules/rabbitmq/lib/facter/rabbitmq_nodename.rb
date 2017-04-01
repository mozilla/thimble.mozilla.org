Facter.add(:rabbitmq_nodename) do
  setcode do
    if Facter::Core::Execution.which('rabbitmqctl')
      rabbitmq_nodename = Facter::Core::Execution.execute('rabbitmqctl status 2>&1')
      %r{^Status of node '?([\w\.]+@[\w\.\-]+)'? \.+$}.match(rabbitmq_nodename)[1]
    end
  end
end
