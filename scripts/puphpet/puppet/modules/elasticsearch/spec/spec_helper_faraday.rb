require 'faraday'

def middleware
  [Faraday::Request::Retry, {}]
end
