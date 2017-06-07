require 'puppet/provider/parsedfile'

case Facter.value('osfamily')
when 'OpenBSD'
  users_roles = '/usr/local/elasticsearch/shield/users_roles'
else
  users_roles = '/usr/share/elasticsearch/shield/users_roles'
end

Puppet::Type.type(:elasticsearch_shield_user_roles).provide(
  :parsed,
  :parent => Puppet::Provider::ParsedFile,
  :default_target => users_roles
) do
  desc "Provider for Shield user roles (parsed file.)"

  confine :exists => users_roles

  def self.parse text
    text.split("\n").map{|l|l.strip}.select do |line|
      # Strip comments
      not line.start_with? '#' and not line.empty?
    end.map do |line|
      # Turn array of roles into array of users that have the role
      role, users = line.split(':')
      users.split(',').map do |user|
        { user => [role] }
      end
    end.flatten.inject({}) do |hash, user|
      # Gather up user => role hashes by append-merging role lists
      hash.merge(user) { |_, o, n| o + n }
    end.map do |user, roles|
      # Map those hashes into what the provider expects
      {
        :name => user,
        :roles => roles
      }
    end.to_a
  end

  def self.to_file records
    debug "Flushing: #{records.inspect}"
    records.map do |record|
      record[:roles].map do |r|
        { [record[:name]] => r }
      end
    end.flatten.map(&:invert).inject({}) do |acc, role|
      acc.merge(role) { |_, o, n| o + n }
    end.delete_if do |_, users|
      users.empty?
    end.map do |role, users|
      "#{role}:#{users.join(',')}"
    end.join("\n") + "\n"
  end

  def self.skip_record? record
    false
  end
end
