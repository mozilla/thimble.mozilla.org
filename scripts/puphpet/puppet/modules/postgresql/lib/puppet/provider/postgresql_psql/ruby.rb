Puppet::Type.type(:postgresql_psql).provide(:ruby) do

  def run_unless_sql_command(sql)
    # for the 'unless' queries, we wrap the user's query in a 'SELECT COUNT',
    # which makes it easier to parse and process the output.
    run_sql_command('SELECT COUNT(*) FROM (' <<  sql << ') count')
  end

  def run_sql_command(sql)
    if resource[:search_path]
      sql = "set search_path to #{Array(resource[:search_path]).join(',')}; #{sql}"
    end

    command = [resource[:psql_path]]
    command.push("-d", resource[:db]) if resource[:db]
    command.push("-p", resource[:port]) if resource[:port]
    command.push("-t", "-c", '"' + sql.gsub('"', '\"') + '"')

    environment = get_environment

    if resource[:cwd]
      Dir.chdir resource[:cwd] do
        run_command(command, resource[:psql_user], resource[:psql_group], environment)
      end
    else
      run_command(command, resource[:psql_user], resource[:psql_group], environment)
    end
  end

  private

  def get_environment
    environment = (resource[:connect_settings] || {}).dup
    if envlist = resource[:environment]
      envlist = [envlist] unless envlist.is_a? Array
      envlist.each do |setting|
        if setting =~ /^(\w+)=((.|\n)+)$/
          env_name = $1
          value = $2
          if environment.include?(env_name) || environment.include?(env_name.to_sym)
            if env_name == 'NEWPGPASSWD'
              warning "Overriding environment setting '#{env_name}' with '****'"
            else
              warning "Overriding environment setting '#{env_name}' with '#{value}'"
            end
          end
          environment[env_name] = value
        else
          warning "Cannot understand environment setting #{setting.inspect}"
        end
      end
    end
    return environment
  end

  def run_command(command, user, group, environment)
    command = command.join ' '
    if Puppet::PUPPETVERSION.to_f < 3.0
      require 'puppet/util/execution'
      Puppet::Util::Execution.withenv environment do
        Puppet::Util::SUIDManager.run_and_capture(command, user, group)
      end
    elsif Puppet::PUPPETVERSION.to_f < 3.4
      Puppet::Util.withenv environment do
        Puppet::Util::SUIDManager.run_and_capture(command, user, group)
      end
    else
      output = Puppet::Util::Execution.execute(command, {
        :uid                => user,
        :gid                => group,
        :failonfail         => false,
        :combine            => true,
        :override_locale    => true,
        :custom_environment => environment,
      })
      [output, $CHILD_STATUS.dup]
    end
  end

end
