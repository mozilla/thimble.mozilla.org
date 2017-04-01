require File.join(File.dirname(__FILE__), '..', 'vcsrepo')

Puppet::Type.type(:vcsrepo).provide(:hg, :parent => Puppet::Provider::Vcsrepo) do
  desc "Supports Mercurial repositories"

  commands :hg => 'hg'

  has_features :reference_tracking, :ssh_identity, :user, :basic_auth

  def create
    if !@resource.value(:source)
      create_repository(@resource.value(:path))
    else
      clone_repository(@resource.value(:revision))
    end
    update_owner
  end

  def working_copy_exists?
    File.directory?(File.join(@resource.value(:path), '.hg'))
  end

  def exists?
    working_copy_exists?
  end

  def destroy
    FileUtils.rm_rf(@resource.value(:path))
  end

  def latest?
    at_path do
      return self.revision == self.latest
    end
  end

  def latest
    at_path do
      begin
        hg_wrapper('incoming', '--branch', '.', '--newest-first', '--limit', '1', { :remote => true })[/^changeset:\s+(?:-?\d+):(\S+)/m, 1]
      rescue Puppet::ExecutionFailure
        # If there are no new changesets, return the current nodeid
        self.revision
      end
    end
  end

  def revision
    at_path do
      current = hg_wrapper('parents')[/^changeset:\s+(?:-?\d+):(\S+)/m, 1]
      desired = @resource.value(:revision)
      if desired
        # Return the tag name if it maps to the current nodeid
        mapped = hg_wrapper('tags')[/^#{Regexp.quote(desired)}\s+\d+:(\S+)/m, 1]
        if current == mapped
          desired
        else
          current
        end
      else
        current
      end
    end
  end

  def revision=(desired)
    at_path do
      begin
        hg_wrapper('pull', { :remote => true })
      rescue
      end
      begin
        hg_wrapper('merge')
      rescue Puppet::ExecutionFailure
        # If there's nothing to merge, just skip
      end
      hg_wrapper('update', '--clean', '-r', desired)
    end
    update_owner
  end

  private

  def create_repository(path)
    hg_wrapper('init', path)
  end

  def clone_repository(revision)
    args = ['clone']
    if revision
      args.push('-u', revision)
    end
    args.push(@resource.value(:source),
              @resource.value(:path))
    args.push({ :remote => true })
    hg_wrapper(*args)
  end

  def update_owner
    if @resource.value(:owner) or @resource.value(:group)
      set_ownership
    end
  end

  def hg_wrapper(*args)
    options = { :remote => false }
    if args.length > 0 and args[-1].is_a? Hash
      options.merge!(args.pop)
    end

    if @resource.value(:basic_auth_username) && @resource.value(:basic_auth_password)
      args += [
        "--config", "\"auth.x.prefix=#{@resource.value(:source)}\"",
        "--config", "\"auth.x.username=#{@resource.value(:basic_auth_username)}\"",
        "--config", "\"auth.x.password=#{@resource.value(:basic_auth_password)}\"",
        "--config", "\"auth.x.schemes=http https\""
      ]
    end

    if options[:remote] and @resource.value(:identity)
      args += ["--ssh", "ssh -oStrictHostKeyChecking=no -oPasswordAuthentication=no -oKbdInteractiveAuthentication=no -oChallengeResponseAuthentication=no -i #{@resource.value(:identity)}"]
    end
    if @resource.value(:user) and @resource.value(:user) != Facter['id'].value
      args.map! { |a| if a =~ /\s/ then "'#{a}'" else a end }  # Adds quotes to arguments with whitespaces.
      Puppet::Util::Execution.execute("hg #{args.join(' ')}", :uid => @resource.value(:user), :failonfail => true, :combine => true)
    else
      hg(*args)
    end
  end
end
