shared_examples_for 'validate parameters' do
  [
    'autoupgrade',
  ].each do |param|
    context "with #{param} => 'foo'" do
      let(:params) {{ param.to_sym => 'foo' }}
      it { expect { should create_class('timezone') }.to raise_error(Puppet::Error, /is not a boolean/) }
    end
  end
end
