require 'spec_helper'

describe 'mongodb::db', :type => :define do
  context 'default' do
    let(:title) { 'testdb' }

    let(:params) {
      { 'user'     => 'testuser',
        'password' => 'testpass',
      }
    }

    it 'should contain mongodb_database with mongodb::server requirement' do
      is_expected.to contain_mongodb_database('testdb')
    end

    it 'should contain mongodb_user with mongodb_database requirement' do
      is_expected.to contain_mongodb_user('User testuser on db testdb').with({
        'username' => 'testuser',
        'database' => 'testdb',
        'require'  => 'Mongodb_database[testdb]',
      })
    end

    it 'should contain mongodb_user with proper roles' do
      params.merge!({'roles' => ['testrole1', 'testrole2']})
      is_expected.to contain_mongodb_user('User testuser on db testdb')\
        .with_roles(["testrole1", "testrole2"])
    end

    it 'should prefer password_hash instead of password' do
      params.merge!({'password_hash' => 'securehash'})
      is_expected.to contain_mongodb_user('User testuser on db testdb')\
        .with_password_hash('securehash')
    end

    it 'should contain mongodb_database with proper tries param' do
      params.merge!({'tries' => 5})
      is_expected.to contain_mongodb_database('testdb').with_tries(5)
    end
  end

  context 'with a db_name value' do
    let(:title) { 'testdb-title' }

    let(:params) {
      { 
        'db_name'  => 'testdb',
        'user'     => 'testuser',
        'password' => 'testpass',
      }
    }

    it 'should contain mongodb_database with mongodb::server requirement' do
      is_expected.to contain_mongodb_database('testdb')
    end

    it 'should contain mongodb_user with mongodb_database requirement' do
      is_expected.to contain_mongodb_user('User testuser on db testdb').with({
        'username' => 'testuser',
        'database' => 'testdb',
        'require'  => 'Mongodb_database[testdb]',
      })
    end

    it 'should contain mongodb_user with proper roles' do
      params.merge!({'roles' => ['testrole1', 'testrole2']})
      is_expected.to contain_mongodb_user('User testuser on db testdb')\
        .with_roles(["testrole1", "testrole2"])
    end

    it 'should prefer password_hash instead of password' do
      params.merge!({'password_hash' => 'securehash'})
      is_expected.to contain_mongodb_user('User testuser on db testdb')\
        .with_password_hash('securehash')
    end

    it 'should contain mongodb_database with proper tries param' do
      params.merge!({'tries' => 5})
      is_expected.to contain_mongodb_database('testdb').with_tries(5)
    end
  end
end
