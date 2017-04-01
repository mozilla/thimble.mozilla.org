require 'spec_helper_acceptance'

describe 'postgresql_psql', :unless => UNSUPPORTED_PLATFORMS.include?(fact('osfamily')) do

  it 'should always run SQL' do
    pp = <<-EOS
      class { 'postgresql::server': } ->
      postgresql_psql { 'foobar':
        db        => 'postgres',
        psql_user => 'postgres',
        command   => 'select 1',
      }
    EOS

    apply_manifest(pp, :catch_failures => true)
    apply_manifest(pp, :expect_changes => true)
  end

  it 'should run some SQL when the unless query returns no rows' do
    pp = <<-EOS
      class { 'postgresql::server': } ->
      postgresql_psql { 'foobar':
        db        => 'postgres',
        psql_user => 'postgres',
        command   => 'select 1',
        unless    => 'select 1 where 1=2',
      }
    EOS

    apply_manifest(pp, :catch_failures => true)
    apply_manifest(pp, :expect_changes  => true)
  end

  it 'should not run SQL when the unless query returns rows' do
    pp = <<-EOS
      class { 'postgresql::server': } ->
      postgresql_psql { 'foobar':
        db        => 'postgres',
        psql_user => 'postgres',
        command   => 'select * from pg_database limit 1',
        unless    => 'select 1 where 1=1',
      }
    EOS

    apply_manifest(pp, :catch_failures => true)
    apply_manifest(pp, :catch_changes => true)
  end

  it 'should not run SQL when refreshed and the unless query returns rows' do
    pp = <<-EOS
      class { 'postgresql::server': } ->
      notify { 'trigger': } ~>
      postgresql_psql { 'foobar':
        db        => 'postgres',
        psql_user => 'postgres',
        command   => 'invalid sql statement',
        unless    => 'select 1 where 1=1',
      }
    EOS

    apply_manifest(pp, :catch_failures => true)
    apply_manifest(pp, :expect_changes => true)
  end

  context 'with refreshonly' do
    it 'should not run SQL when the unless query returns no rows' do
      pp = <<-EOS
        class { 'postgresql::server': } ->
        postgresql_psql { 'foobar':
          db          => 'postgres',
          psql_user   => 'postgres',
          command     => 'select 1',
          unless      => 'select 1 where 1=2',
          refreshonly => true,
        }
      EOS

      apply_manifest(pp, :catch_failures => true)
      apply_manifest(pp, :catch_changes  => true)
    end

    it 'should run SQL when refreshed and the unless query returns no rows' do
      pp = <<-EOS.unindent
        class { 'postgresql::server': } ->
        notify { 'trigger': } ~>
        postgresql_psql { 'foobar':
          db          => 'postgres',
          psql_user   => 'postgres',
          command     => 'select 1',
          unless      => 'select 1 where 1=2',
          refreshonly => true,
        }
      EOS

      apply_manifest(pp, :catch_failures => true)
      apply_manifest(pp, :expect_changes => true)
    end

    it 'should not run SQL when refreshed and the unless query returns rows' do
      pp = <<-EOS.unindent
        class { 'postgresql::server': } ->
        notify { 'trigger': } ~>
        postgresql_psql { 'foobar':
          db          => 'postgres',
          psql_user   => 'postgres',
          command     => 'invalid sql query',
          unless      => 'select 1 where 1=1',
          refreshonly => true,
        }
      EOS

      apply_manifest(pp, :catch_failures => true)
      apply_manifest(pp, :expect_changes => true)
    end
  end

  it 'should not run some SQL when the onlyif query returns no rows' do
    pp = <<-EOS
      class { 'postgresql::server': } ->
      postgresql_psql { 'foobar':
        db        => 'postgres',
        psql_user => 'postgres',
        command   => 'select 1',
        onlyif    => 'select 1 where 1=2',
      }
    EOS

    apply_manifest(pp, :catch_failures => true)
    apply_manifest(pp, :catch_changes  => true)
  end

  it 'should run SQL when the onlyif query returns rows' do
    pp = <<-EOS
      class { 'postgresql::server': } ->
      postgresql_psql { 'foobar':
        db        => 'postgres',
        psql_user => 'postgres',
        command   => 'select * from pg_database limit 1',
        onlyif    => 'select 1 where 1=1',
      }
    EOS

    apply_manifest(pp, :catch_failures => true)
    apply_manifest(pp, :expect_changes => true)
  end

  context 'with secure password passing by environment' do
    it 'should run SQL that contanins password passed by environment' do
      select = "select \\'$PASS_TO_EMBED\\'"
      pp = <<-EOS.unindent
        class { 'postgresql::server': } ->
        postgresql_psql { 'password embedded by environment: #{select}':
          db          => 'postgres',
          psql_user   => 'postgres',
          command     => '#{select}',
          environment => [
            'PASS_TO_EMBED=pa$swD',
          ],
        }
      EOS
      apply_manifest(pp, :catch_failures => true)
      apply_manifest(pp, :expect_changes => false)
    end
    it 'should run SQL that contanins password passed by environment in check' do
      select = "select 1 where \\'$PASS_TO_EMBED\\'=\\'passwD\\'"
      pp = <<-EOS.unindent
        class { 'postgresql::server': } ->
        postgresql_psql { 'password embedded by environment in check: #{select}':
          db          => 'postgres',
          psql_user   => 'postgres',
          command     => 'invalid sql query',
          unless      => '#{select}',
          environment => [
            'PASS_TO_EMBED=passwD',
          ],
        }
      EOS

      apply_manifest(pp, :catch_failures => true)
      apply_manifest(pp, :expect_changes => false)
    end
  end
end
