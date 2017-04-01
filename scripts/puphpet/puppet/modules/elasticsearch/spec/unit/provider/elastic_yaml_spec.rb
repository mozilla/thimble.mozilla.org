$LOAD_PATH.unshift(File.join(File.dirname(__FILE__),'..','..','lib'))

require 'spec_helper'
require 'puppet/provider/elastic_yaml'

class String
  def flattened
    split("\n").reject(&:empty?).map(&:strip).join("\n").strip
  end
end

describe Puppet::Provider::ElasticYaml do

  subject do
    described_class.tap do |o|
      o.instance_eval { @metadata = :metadata }
    end
  end

  let :unsorted_hash do
    [{
      :name => 'role',
      :metadata => {
        'zeta' => {
          'zeta'  => 5,
          'gamma' => 4,
          'delta' => 3,
          'beta'  => 2,
          'alpha' => 1
        },
        'phi' => [{
          'zeta'  => 3,
          'gamma' => 2,
          'alpha' => 1
        }],
        'beta'  => 'foobaz',
        'gamma' => 1,
        'alpha' => 'foobar'
      }
    }]
  end

  it { is_expected.to respond_to :to_file }

  describe 'to_file' do
    it 'returns sorted yaml' do
      expect(described_class.to_file(unsorted_hash).flattened).to(
        eq(%q{
          ---
          role:
            alpha: foobar
            beta: foobaz
            gamma: 1
            phi:
              - alpha: 1
                gamma: 2
                zeta: 3
            zeta:
              alpha: 1
              beta: 2
              delta: 3
              gamma: 4
              zeta: 5
        }.flattened)
      )
    end
  end
end
