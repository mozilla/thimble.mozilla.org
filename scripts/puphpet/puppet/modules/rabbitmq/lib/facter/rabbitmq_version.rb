Facter.add(:rabbitmq_version) do
  setcode do
    if Facter::Core::Execution.which('rabbitmqadmin')
      rabbitmq_version = Facter::Core::Execution.execute('rabbitmqadmin --version 2>&1')
      %r{^rabbitmqadmin ([\w\.]+)}.match(rabbitmq_version)[1]
    end
  end
end
