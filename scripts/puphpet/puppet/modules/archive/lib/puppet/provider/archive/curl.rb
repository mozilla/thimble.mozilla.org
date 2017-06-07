Puppet::Type.type(:archive).provide(:curl, parent: :ruby) do
  commands curl: 'curl'
  defaultfor feature: :posix

  def curl_params(params)
    account = [resource[:username], resource[:password]].compact.join(':') if resource[:username]
    params += optional_switch(account, ['--user', '%s'])
    params += optional_switch(resource[:cookie], ['--cookie', '%s'])
    params += optional_switch(resource[:proxy_server], ['--proxy', '%s'])
    params += ['--insecure'] if resource[:allow_insecure]

    params
  end

  def download(filepath)
    params = curl_params(
      [
        resource[:source],
        '-o',
        filepath,
        '-fsSL',
        '--max-redirs',
        5
      ]
    )

    curl(params)
  end

  def remote_checksum
    params = curl_params(
      [
        resource[:checksum_url],
        '-fsSL',
        '--max-redirs',
        5
      ]
    )

    curl(params)[%r{\b[\da-f]{32,128}\b}i]
  end
end
