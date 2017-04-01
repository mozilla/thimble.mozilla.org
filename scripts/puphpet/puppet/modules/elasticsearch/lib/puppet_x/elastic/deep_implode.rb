module Puppet_X
  module Elastic
    def self.deep_implode(hash)
      ret = Hash.new
      implode ret, hash
      ret
    end

    def self.implode(new_hash, hash, path=[])
      hash.sort_by{|k,v| k.length}.reverse.each do |key, value|
        new_path = path + [key]
        case value
        when Hash
          implode(new_hash, value, new_path)
        else
          new_key = new_path.join('.')
          if value.is_a? Array \
              and new_hash.has_key? new_key \
              and new_hash[new_key].is_a? Array
              new_hash[new_key] += value
          else
            new_hash[new_key] ||= value
          end
        end
      end
    end # of deep_implode
  end # of Elastic
end # of Puppet_X
