require 'spec_helper'

describe 'wget::fetch' do
  let(:title) { 'test' }
  let(:facts) {{}}

  let(:params) {{
    :source      => 'http://localhost/source',
    :destination => destination,
  }}

  let(:destination) { "/tmp/dest" }

  context "with default params", :compile do
    it { should contain_exec('wget-test').with({
      'command' => "wget --no-verbose --output-document=\"#{destination}\" \"http://localhost/source\"",
      'environment' => []
    }) }
  end

  context "with user", :compile do
    let(:params) { super().merge({
      :execuser => 'testuser',
    })}

    it { should contain_exec('wget-test').with({
      'command' => "wget --no-verbose --output-document=\"#{destination}\" \"http://localhost/source\"",
      'user' => 'testuser',
      'environment' => []
    }) }
  end

  context "with authentication", :compile do
    let(:params) { super().merge({
      :user => 'myuser',
      :password => 'mypassword'
    })}

    context "with default params" do
      it { should contain_exec('wget-test').with({
        'command'     => "wget --no-verbose --user=myuser --output-document=\"#{destination}\" \"http://localhost/source\"",
        'environment' => ["WGETRC=#{destination}.wgetrc"]
        })
      }
      it { should contain_file("#{destination}.wgetrc").with_content('password=mypassword') }
    end

    context "with user", :compile do
      let(:params) { super().merge({
        :execuser => 'testuser',
      })}

      it { should contain_exec('wget-test').with({
        'command' => "wget --no-verbose --user=myuser --output-document=\"#{destination}\" \"http://localhost/source\"",
        'user' => 'testuser',
        'environment' => ["WGETRC=#{destination}.wgetrc"]
      }) }
    end

    context "using proxy", :compile do
      let(:facts) { super().merge({
        :http_proxy => 'http://proxy:1000',
        :https_proxy => 'http://proxy:1000'
      }) }
      it { should contain_exec('wget-test').with({
        'command'     => "wget --no-verbose --user=myuser --output-document=\"#{destination}\" \"http://localhost/source\"",
        'environment' => ["HTTP_PROXY=http://proxy:1000", "http_proxy=http://proxy:1000", "HTTPS_PROXY=http://proxy:1000", "https_proxy=http://proxy:1000", "WGETRC=#{destination}.wgetrc"]
        })
      }
      it { should contain_file("#{destination}.wgetrc").with_content('password=mypassword') }
    end
  end

  context "with cache", :compile do
    let(:params) { super().merge({
      :cache_dir => '/tmp/cache',
      :execuser  => 'testuser',
    })}

    it { should contain_exec('wget-test').with({
      'command' => "wget --no-verbose -N -P \"/tmp/cache\" \"http://localhost/source\"",
      'environment' => []
    }) }

    it { should contain_file("#{destination}").with({
      'ensure'  => "file",
      'source'  => "/tmp/cache/source",
      'owner'   => "testuser",
    }) }
  end

  context "with cache file", :compile do
    let(:params) { super().merge({
      :cache_dir  => '/tmp/cache',
      :cache_file => 'newsource',
      :execuser   => 'testuser',
    })}

    it { should contain_exec('wget-test').with({
      'command' => "wget --no-verbose -N -P \"/tmp/cache\" \"http://localhost/source\"",
      'environment' => []
    }) }

    it { should contain_file("#{destination}").with({
      'ensure'  => "file",
      'source'  => "/tmp/cache/newsource",
      'owner'   => "testuser",
    }) }
  end

  context "with multiple headers", :compile do
    let(:params) { super().merge({
      :headers => ['header1', 'header2'],
    })}

    it { should contain_exec('wget-test').with({
      'command' => "wget --no-verbose --header \"header1\" --header \"header2\" --output-document=\"#{destination}\" \"http://localhost/source\"",
      'environment' => []
    }) }
  end

  context "with no-cookies", :compile do
    let(:params) { super().merge({
      :no_cookies => true,
    })}

    it { should contain_exec('wget-test').with({
      'command' => "wget --no-verbose --no-cookies --output-document=\"#{destination}\" \"http://localhost/source\"",
      'environment' => []
    }) }
  end

  context "with flags", :compile do
    let(:params) { super().merge({
      :flags => ['--flag1', '--flag2'],
    })}

    it { should contain_exec('wget-test').with({
      'command' => "wget --no-verbose --output-document=\"#{destination}\" --flag1 --flag2 \"http://localhost/source\"",
      'environment' => []
    }) }
  end

  context "with source_hash", :compile do
    let(:params) { super().merge({
      :source_hash => "d41d8cd98f00b204e9800998ecf8427e",
    })}

    it { should contain_exec('wget-test').with({
      'command' => "wget --no-verbose --output-document=\"#{destination}\" \"http://localhost/source\" && echo 'd41d8cd98f00b204e9800998ecf8427e  #{destination}' | md5sum -c --quiet",
      'environment' => []
    }) }

    it { should contain_exec('wget-source_hash-check-test').with({
      'command' => "test ! -e '#{destination}' || rm #{destination}",
      'unless'  => "echo 'd41d8cd98f00b204e9800998ecf8427e  #{destination}' | md5sum -c --quiet",
    })}
  end

  context "download to dir", :compile do
    let(:params) { super().merge({
      :destination => '/tmp/dest/',
    })}
  
    it { should contain_exec('wget-test').with({
      'command' => "wget --no-verbose --output-document=\"#{destination}//source\" \"http://localhost/source\"",
      'environment' => []
    }) }
  end

  context "with unless", :compile do
    let(:params) { super().merge({
      :unless => "test $(ls -A #{destination} | head -1 2>/dev/null)",
    })}

    it { should contain_exec('wget-test').with({
      'command' => "wget --no-verbose --output-document=\"#{destination}\" \"http://localhost/source\"",
      'unless'  => "test $(ls -A #{destination} | head -1 2>/dev/null)",
    })}
  end

end
