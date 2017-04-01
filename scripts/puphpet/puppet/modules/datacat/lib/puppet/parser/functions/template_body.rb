Puppet::Parser::Functions::newfunction(:template_body, :type => :rvalue) do |args|
  args.collect do |file|
    unless filename = Puppet::Parser::Files.find_template(file, self.compiler.environment)
      raise Puppet::ParseError, "Could not find template '#{file}'"
    end
    File.read(filename)
  end.join('')
end
