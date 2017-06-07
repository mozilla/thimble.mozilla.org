require 'openssl'

def gen_certs num_certs, path
  ret = { :clients => [] }
  serial = 1000000
  ca_key = OpenSSL::PKey::RSA.new 2048

  # CA Cert
  ca_name = OpenSSL::X509::Name.parse 'CN=ca/DC=example'
  ca_cert = OpenSSL::X509::Certificate.new
  ca_cert.serial = serial
  serial += 1
  ca_cert.version = 2
  ca_cert.not_before = Time.now
  ca_cert.not_after = Time.now + 86400
  ca_cert.public_key = ca_key.public_key
  ca_cert.subject = ca_name
  ca_cert.issuer = ca_name
  extension_factory = OpenSSL::X509::ExtensionFactory.new
  extension_factory.subject_certificate = ca_cert
  extension_factory.issuer_certificate = ca_cert
  ca_cert.add_extension extension_factory.create_extension(
    'subjectKeyIdentifier', 'hash'
  )
  ca_cert.add_extension extension_factory.create_extension(
    'basicConstraints', 'CA:TRUE', true
  )
  ca_cert.sign ca_key, OpenSSL::Digest::SHA1.new
  ret[:ca] = {
    :cert => {
      :pem => ca_cert.to_pem,
      :path => path + '/ca_cert.pem',
    }
  }

  num_certs.times do |i|
    key, cert, serial = gen_cert_pair serial, ca_cert
    cert.sign ca_key, OpenSSL::Digest::SHA1.new
    ret[:clients] << {
      :key => {
        :pem => key.to_pem,
        :path => path + '/' + i.to_s + '_key.pem',
      },
      :cert => {
        :pem => cert.to_pem,
        :path => path + '/' + i.to_s + '_cert.pem',
      },
    }
  end

  ret
end

def gen_cert_pair serial, ca_cert
  serial += 1
  # Node Key
  key = OpenSSL::PKey::RSA.new 2048
  node_name = OpenSSL::X509::Name.parse 'CN=localhost/DC=example'

  # Node Cert
  cert = OpenSSL::X509::Certificate.new
  cert.serial = serial
  cert.version = 2
  cert.not_before = Time.now
  cert.not_after = Time.now + 6000

  cert.subject = node_name
  cert.public_key = key.public_key
  cert.issuer = ca_cert.subject

  csr_extension_factory = OpenSSL::X509::ExtensionFactory.new
  csr_extension_factory.subject_certificate = cert
  csr_extension_factory.issuer_certificate = ca_cert

  cert.add_extension csr_extension_factory.create_extension(
    'basicConstraints',
    'CA:FALSE'
  )
  cert.add_extension csr_extension_factory.create_extension(
    'keyUsage',
    'keyEncipherment,dataEncipherment,digitalSignature'
  )
  cert.add_extension csr_extension_factory.create_extension(
    'subjectKeyIdentifier', 'hash'
  )
  [key, cert, serial]
end
