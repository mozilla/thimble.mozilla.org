Puppet::Type.newtype(:file_line) do

  desc <<-EOT
    Ensures that a given line is contained within a file.  The implementation
    matches the full line, including whitespace at the beginning and end.  If
    the line is not contained in the given file, Puppet will append the line to
    the end of the file to ensure the desired state.  Multiple resources may
    be declared to manage multiple lines in the same file.

    Example:

        file_line { 'sudo_rule':
          path => '/etc/sudoers',
          line => '%sudo ALL=(ALL) ALL',
        }

        file_line { 'sudo_rule_nopw':
          path => '/etc/sudoers',
          line => '%sudonopw ALL=(ALL) NOPASSWD: ALL',
        }

    In this example, Puppet will ensure both of the specified lines are
    contained in the file /etc/sudoers.

    Match Example:

        file_line { 'bashrc_proxy':
          ensure => present,
          path   => '/etc/bashrc',
          line   => 'export HTTP_PROXY=http://squid.puppetlabs.vm:3128',
          match  => '^export\ HTTP_PROXY\=',
        }

    In this code example match will look for a line beginning with export
    followed by HTTP_PROXY and replace it with the value in line.

    Match Example With `ensure => absent`:

        file_line { 'bashrc_proxy':
          ensure            => absent,
          path              => '/etc/bashrc',
          line              => 'export HTTP_PROXY=http://squid.puppetlabs.vm:3128',
          match             => '^export\ HTTP_PROXY\=',
          match_for_absence => true,
        }

    In this code example match will look for a line beginning with export
    followed by HTTP_PROXY and delete it.  If multiple lines match, an
    error will be raised unless the `multiple => true` parameter is set.

    **Autorequires:** If Puppet is managing the file that will contain the line
    being managed, the file_line resource will autorequire that file.
  EOT

  ensurable do
    defaultvalues
    defaultto :present
  end

  newparam(:name, :namevar => true) do
    desc 'An arbitrary name used as the identity of the resource.'
  end

  newparam(:match) do
    desc 'An optional ruby regular expression to run against existing lines in the file.' +
         ' If a match is found, we replace that line rather than adding a new line.' +
         ' A regex comparison is performed against the line value and if it does not' +
         ' match an exception will be raised.'
  end

  newparam(:match_for_absence) do
    desc 'An optional value to determine if match should be applied when ensure => absent.' +
         ' If set to true and match is set, the line that matches match will be deleted.' +
         ' If set to false (the default), match is ignored when ensure => absent.'
    newvalues(true, false)
    defaultto false
  end

  newparam(:multiple) do
    desc 'An optional value to determine if match can change multiple lines.' +
         ' If set to false, an exception will be raised if more than one line matches'
    newvalues(true, false)
  end

  newparam(:after) do
    desc 'An optional value used to specify the line after which we will add any new lines. (Existing lines are added in place)'
  end

  newparam(:line) do
    desc 'The line to be appended to the file or used to replace matches found by the match attribute.'
  end

  newparam(:path) do
    desc 'The file Puppet will ensure contains the line specified by the line parameter.'
    validate do |value|
      unless (Puppet.features.posix? and value =~ /^\//) or (Puppet.features.microsoft_windows? and (value =~ /^.:\// or value =~ /^\/\/[^\/]+\/[^\/]+/))
        raise(Puppet::Error, "File paths must be fully qualified, not '#{value}'")
      end
    end
  end

  newparam(:replace) do
    desc 'If true, replace line that matches. If false, do not write line if a match is found'
    newvalues(true, false)
    defaultto true
  end

  # Autorequire the file resource if it's being managed
  autorequire(:file) do
    self[:path]
  end

  validate do
    unless self[:line]
      unless (self[:ensure].to_s == 'absent') and (self[:match_for_absence].to_s == 'true') and self[:match]
        raise(Puppet::Error, "line is a required attribute")
      end
    end
    unless self[:path]
      raise(Puppet::Error, "path is a required attribute")
    end
  end
end
