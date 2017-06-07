Puppet::Type.type(:archive).provide(:wget, parent: :ruby) do
  commands wget: 'wget'

  def wget_params(params)
    params += optional_switch(resource[:username], ['--user=%s'])
    params += optional_switch(resource[:password], ['--password=%s'])
    params += optional_switch(resource[:cookie], ['--header="Cookie: %s"'])
    params += optional_switch(resource[:proxy_server], ["--#{resource[:proxy_type]}_proxy=#{resource[:proxy_server]}"])
    params += ['--no-check-certificate'] if resource[:allow_insecure]

    params
  end

  def download(filepath)
    params = wget_params(
      [
        Shellwords.shellescape(resource[:source]),
        '-O',
        filepath,
        '--max-redirect=5'
      ]
    )

    # NOTE:
    # Do NOT use wget(params) until https://tickets.puppetlabs.com/browse/PUP-6066 is resolved.
    command = "wget #{params.join(' ')}"
    Puppet::Util::Execution.execute(command)
  end

  def remote_checksum
    params = wget_params(
      [
        '-qO-',
        Shellwords.shellescape(resource[:checksum_url]),
        '--max-redirect=5'
      ]
    )

    command = "wget #{params.join(' ')}"
    Puppet::Util::Execution.execute(command)[%r{\b[\da-f]{32,128}\b}i]
  end
end
