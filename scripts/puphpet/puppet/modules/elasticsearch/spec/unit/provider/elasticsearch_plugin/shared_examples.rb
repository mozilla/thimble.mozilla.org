require 'puppet/util/package'

shared_examples 'plugin provider' do |version, build|
  describe "elasticsearch #{version}" do
    before(:each) do
      klass.expects(:es).with('-version').returns(build)
      allow(File).to receive(:open)
      provider.es_version
    end

    describe 'setup' do
      it 'installs with default parameters' do
        provider.expects(:plugin).with(
          ['install', resource_name].tap do |args|
            if build =~ (/^\S+\s+([^,]+),/)
              if Puppet::Util::Package.versioncmp($1, '2.2.0') >= 0
                args.insert 1, '--batch'
              end
              if $1.start_with? '2'
                args.unshift '-Des.path.conf=/usr/share/elasticsearch'
              end
            end
          end
        )
        provider.create
      end

      it 'installs via URLs' do
        resource[:url] = 'http://url/to/my/plugin.zip'
        provider.expects(:plugin).with(['install'].tap { |args|
              if version.start_with? '2'
                args.unshift '-Des.path.conf=/usr/share/elasticsearch'
              end
            } + ['http://url/to/my/plugin.zip'].tap { |args|
            build =~ (/^\S+\s+([^,]+),/)
            if $1.start_with? '1'
              args.unshift('kopf', '--url')
            end

            if Puppet::Util::Package.versioncmp($1, '2.2.0') >= 0
              args.unshift '--batch'
            end

            args
          }
        )
        provider.create
      end

      it 'installs with a local file' do
        resource[:source] = '/tmp/plugin.zip'
        provider.expects(:plugin).with(['install'].tap { |args|
            if version.start_with? '2'
              args.unshift '-Des.path.conf=/usr/share/elasticsearch'
            end
          } + ['file:///tmp/plugin.zip'].tap { |args|
            build =~ (/^\S+\s+([^,]+),/)
            if $1.start_with? '1'
              args.unshift('kopf', '--url')
            end

            if Puppet::Util::Package.versioncmp($1, '2.2.0') >= 0
              args.unshift '--batch'
            end

            args
          }
        )
        provider.create
      end

      it 'sets the path.conf Elasticsearch Java property' do
        expect(provider.with_environment do
          ENV['ES_JAVA_OPTS']
        end).to eq('-Des.path.conf=/usr/share/elasticsearch')
      end

      describe 'proxying' do
        it 'installs behind a proxy' do
          resource[:proxy] = 'http://localhost:3128'
          expect(provider.with_environment do
            ENV['ES_JAVA_OPTS']
          end).to eq([
            '-Des.path.conf=/usr/share/elasticsearch',
            '-Dhttp.proxyHost=localhost',
            '-Dhttp.proxyPort=3128',
            '-Dhttps.proxyHost=localhost',
            '-Dhttps.proxyPort=3128'
          ].join(' '))
        end

        it 'uses authentication credentials' do
          resource[:proxy] = 'http://elastic:password@es.local:8080'
          expect(provider.with_environment do
            ENV['ES_JAVA_OPTS']
          end).to eq([
            '-Des.path.conf=/usr/share/elasticsearch',
            '-Dhttp.proxyHost=es.local',
            '-Dhttp.proxyPort=8080',
            '-Dhttp.proxyUser=elastic',
            '-Dhttp.proxyPassword=password',
            '-Dhttps.proxyHost=es.local',
            '-Dhttps.proxyPort=8080',
            '-Dhttps.proxyUser=elastic',
            '-Dhttps.proxyPassword=password'
          ].join(' '))
        end
      end
    end # of setup

    describe 'plugin_name' do
      let(:resource_name) { 'appbaseio/dejaVu' }

      it 'maintains mixed-case names' do
        expect(provider.pluginfile).to include('dejaVu')
      end
    end

    describe 'removal' do
      it 'uninstalls the plugin' do
        provider.expects(:plugin).with(['remove', resource_name])
        provider.destroy
      end
    end
  end
end
