
def get_url

  urls = { 
    'URL_MASTER' => 'http://s3-eu-west-1.amazonaws.com/build-eu.elasticsearch.org/origin/master/nightly/JDK7/elasticsearch-latest-SNAPSHOT.$EXT$',
    'URL_SNAP' => 'http://s3-eu-west-1.amazonaws.com/build.eu-west-1.elastic.co/origin/$VERSION$/nightly/JDK7/elasticsearch-latest-SNAPSHOT.$EXT$',
    'URL_TAGS' => 'http://download.elastic.co/elasticsearch/elasticsearch/elasticsearch-$VERSION$.$EXT$',
    'URL_TAGS2' => 'https://download.elasticsearch.org/elasticsearch/release/org/elasticsearch/distribution/$EXT$/elasticsearch/$VERSION$/elasticsearch-$VERSION$.$EXT$'
  }

  es_version = ENV['ES_VERSION']

  if es_version == 'MASTER_nightly'
    # We are testing the master branch snapshot
    url = urls['URL_MASTER']
  elsif es_version =~ /_nightly$/
    # We are testing a version snapshot
    ver = es_version.split('_')[0]
    url = urls["URL_SNAP"].gsub('$VERSION$', ver)
  else
    # we are testing a released version
    if es_version =~ /^2/
      _url = urls['URL_TAGS2']
    else
      _url = urls['URL_TAGS']
    end
    url = _url.gsub('$VERSION$', es_version)
  end

  return url

end
