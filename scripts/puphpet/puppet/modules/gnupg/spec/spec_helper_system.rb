require 'rspec-system/spec_helper'
require 'rspec-system-puppet/helpers'
require 'rspec-system-serverspec/helpers'
require 'tempfile'

include Serverspec::Helper::RSpecSystem
include Serverspec::Helper::DetectOS
include RSpecSystemPuppet::Helpers

class String
  # Provide ability to remove indentation from strings, for the purpose of
  # left justifying heredoc blocks.
  def unindent
    gsub(/^#{scan(/^\s*/).min_by{|l|l.length}}/, "")
  end
end

module LocalHelpers
  include RSpecSystem::Util

  def gpg(gpg_cmd, user = 'root', &block)
    gpg = "gpg #{gpg_cmd}"
    shell("su #{shellescape(user)} -c #{shellescape(gpg)}", &block)
  end
end

RSpec.configure do |c|
  # Project root
  proj_root = File.expand_path(File.join(File.dirname(__FILE__), '..'))

  # Enable colour
  c.tty = true

  # Include in our local helpers, because some puppet images run
  # as diffrent users
  c.include ::LocalHelpers

  # Puppet helpers
  c.include RSpecSystemPuppet::Helpers
  c.extend RSpecSystemPuppet::Helpers

  # This is where we 'setup' the nodes before running our tests
  c.before :suite do
    # Install puppet
    puppet_install

    # Install my module from the current working copy
    puppet_module_install(:source => proj_root, :module_name => 'gnupg')
    shell 'whoami'
    shell 'puppet module list'

    # disable hiera warnings
    file = Tempfile.new('foo')
    begin
      file.write(<<-EOS)
---
:logger: noop
      EOS
      file.close
      rcp(:sp => file.path, :dp => '/etc/puppet/hiera.yaml')
    ensure
      file.unlink
    end
  end
end

