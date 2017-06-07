# rubocop:disable RSpec/MessageExpectation, RSpec/MultipleExpectations
wget_provider = Puppet::Type.type(:archive).provider(:wget)

RSpec.describe wget_provider do
  it_behaves_like 'an archive provider', wget_provider

  describe '#download' do
    let(:name)      { '/tmp/example.zip' }
    let(:resource)  { Puppet::Type::Archive.new(resource_properties) }
    let(:provider)  { wget_provider.new(resource) }
    let(:execution) { Puppet::Util::Execution }

    let(:default_options) do
      [
        'wget',
        'http://home.lan/example.zip',
        '-O',
        '/tmp/example.zip',
        '--max-redirect=5'
      ]
    end

    before do
      allow(FileUtils).to receive(:mv)
    end

    context 'no extra properties specified' do
      let(:resource_properties) do
        {
          name: name,
          source: 'http://home.lan/example.zip'
        }
      end

      it 'calls wget with input, output and --max-redirects=5' do
        expect(execution).to receive(:execute).with(default_options.join(' '))
        provider.download(name)
      end
    end

    context 'username specified' do
      let(:resource_properties) do
        {
          name: name,
          source: 'http://home.lan/example.zip',
          username: 'foo'
        }
      end

      it 'calls wget with default options and username' do
        expect(execution).to receive(:execute).with([default_options, '--user=foo'].join(' '))
        provider.download(name)
      end
    end

    context 'password specified' do
      let(:resource_properties) do
        {
          name: name,
          source: 'http://home.lan/example.zip',
          password: 'foo'
        }
      end

      it 'calls wget with default options and password' do
        expect(execution).to receive(:execute).with([default_options, '--password=foo'].join(' '))
        provider.download(name)
      end
    end

    context 'cookie specified' do
      let(:resource_properties) do
        {
          name: name,
          source: 'http://home.lan/example.zip',
          cookie: 'foo'
        }
      end

      it 'calls wget with default options and header containing cookie' do
        expect(execution).to receive(:execute).with([default_options, '--header="Cookie: foo"'].join(' '))
        provider.download(name)
      end
    end

    context 'proxy specified' do
      let(:resource_properties) do
        {
          name: name,
          source: 'http://home.lan/example.zip',
          proxy_server: 'https://home.lan:8080'
        }
      end

      it 'calls wget with default options and header containing cookie' do
        expect(execution).to receive(:execute).with([default_options, '--https_proxy=https://home.lan:8080'].join(' '))
        provider.download(name)
      end
    end

    context 'allow_insecure true' do
      let(:resource_properties) do
        {
          name: name,
          source: 'http://home.lan/example.zip',
          allow_insecure: true
        }
      end

      it 'calls wget with default options and --no-check-certificate' do
        expect(execution).to receive(:execute).with([default_options, '--no-check-certificate'].join(' '))
        provider.download(name)
      end
    end
    describe '#checksum' do
      subject { provider.checksum }
      let(:url) { nil }
      let(:resource_properties) do
        {
          name: name,
          source: 'http://home.lan/example.zip'
        }
      end

      before do
        resource[:checksum_url] = url if url
      end

      context 'with a url' do
        let(:wget_params) do
          [
            'wget',
            '-qO-',
            'http://example.com/checksum',
            '--max-redirect=5'
          ]
        end

        let(:url) { 'http://example.com/checksum' }
        context 'responds with hash' do
          let(:remote_hash) { 'a0c38e1aeb175201b0dacd65e2f37e187657050a' }
          it do
            expect(Puppet::Util::Execution).to receive(:execute).with(wget_params.join(' ')).and_return("a0c38e1aeb175201b0dacd65e2f37e187657050a README.md\n")
            expect(provider.checksum).to eq('a0c38e1aeb175201b0dacd65e2f37e187657050a')
          end
        end
      end
    end
  end
end
