require 'spec_helper'

describe 'mongodb::mongos::install', :type => :class do

  describe 'it should include package' do
    with_debian_facts

    let :pre_condition do
      "class { 'mongodb::mongos':
         configdb     => ['127.0.0.1:27019'],
         package_name => 'mongo-foo',
       }"
    end

    it {
      is_expected.to contain_package('mongodb_mongos').with({
        :ensure => 'present',
        :name   => 'mongo-foo',
      })
    }
  end

end
