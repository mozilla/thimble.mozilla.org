require 'spec_helper'

describe 'nodejs', :type => :class do
  let(:title) { 'nodejs' }

  let(:facts) {{
    :nodejs_stable_version => 'v0.10.20'
  }}

  describe 'with default parameters' do
    it { should contain_nodejs__install('nodejs-stable') \
      .with_version('stable') \
      .with_target_dir('/usr/local/bin') \
      .with_with_npm('true') \
      .with_make_install('true')
    }

    it { should contain_file('/usr/local/node/node-default') \
      .with_ensure('link') \
      .with_target('/usr/local/node/node-v0.10.20')
    }

    it { should contain_file('/usr/local/bin/node') \
      .with_ensure('link') \
      .with_target('/usr/local/node/node-default/bin/node')
    }

    it { should contain_file('/usr/local/bin/npm') \
      .with_ensure('link') \
      .with_target('/usr/local/node/node-default/bin/npm')
    }

    it { should contain_file('/etc/profile.d/nodejs.sh') }
  end

  describe 'with a given version' do
    let(:params) {{
      :version  => 'v0.10.0',
    }}

    it { should contain_nodejs__install('nodejs-v0.10.0') \
      .with_version('v0.10.0')
    }

    it { should contain_file('/usr/local/node/node-default') \
      .with_ensure('link') \
      .with_target('/usr/local/node/node-v0.10.0')
    }
  end

  describe 'with a given target_dir' do
    let(:params) {{
      :target_dir  => '/bin',
    }}

    it { should contain_nodejs__install('nodejs-stable') \
      .with_target_dir('/bin') \
    }
  end

  describe 'without NPM' do
    let(:params) {{
      :with_npm => false
    }}

    it { should contain_nodejs__install('nodejs-stable') \
      .with_with_npm('false')
    }
  end

  describe 'with make_install = false' do
    let(:params) {{
      :make_install => false
    }}

    it { should contain_nodejs__install('nodejs-stable') \
      .with_make_install('false')
    }
  end

  describe 'with node_path' do
    let(:params) {{
      :node_path => '/usr/local/node/node-v5.4.1/lib/node_modules'
    }}

    it { should contain_file('/etc/profile.d/nodejs.sh') \
        .with_content(/(.*)NODE_PATH=\/usr\/local\/node\/node-v5.4.1\/lib\/node_modules/)
    }
  end
end
