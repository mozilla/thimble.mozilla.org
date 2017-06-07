  test_settings['cluster_name'] = SecureRandom.hex(10)

  test_settings['repo_version2x']          = '2.x'
  test_settings['repo_version']            = '1.4'
  test_settings['install_package_version'] = '1.4.4'
  test_settings['install_version']         = '1.4.4'
  test_settings['upgrade_package_version'] = '1.4.5'
  test_settings['upgrade_version']         = '1.4.5'

  test_settings['shield_user']             = 'elastic'
  test_settings['shield_password']         = SecureRandom.hex
  test_settings['shield_hashed_password']  = '$2a$10$DddrTs0PS3qNknUTq0vpa.g.0JpU.jHDdlKp1xox1W5ZHX.w8Cc8C'
  test_settings['shield_hashed_plaintext'] = 'foobar'
  case fact('osfamily')
    when 'RedHat'
      test_settings['url']             = 'http://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-1.3.1.noarch.rpm'
      test_settings['local']           = '/tmp/elasticsearch-1.3.1.noarch.rpm'
      test_settings['puppet']          = 'elasticsearch-1.3.1.noarch.rpm'
      test_settings['package_name']    = 'elasticsearch'
      test_settings['service_name_a']  = 'elasticsearch-es-01'
      test_settings['service_name_b']  = 'elasticsearch-es-02'
      test_settings['pid_file_a']      = '/var/run/elasticsearch/elasticsearch-es-01.pid'
      test_settings['pid_file_b']      = '/var/run/elasticsearch/elasticsearch-es-02.pid'
      test_settings['defaults_file_a'] = '/etc/sysconfig/elasticsearch-es-01'
      test_settings['defaults_file_b'] = '/etc/sysconfig/elasticsearch-es-02'
      test_settings['port_a']          = '9200'
      test_settings['port_b']          = '9201'
    when 'Debian'
      case fact('operatingsystem')
        when 'Ubuntu'
          test_settings['url']             = 'http://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-1.3.1.deb'
          test_settings['local']           = '/tmp/elasticsearch-1.3.1.deb'
          test_settings['puppet']          = 'elasticsearch-1.3.1.deb'
          test_settings['pid_file_a']      = '/var/run/elasticsearch-es-01.pid'
          test_settings['pid_file_b']      = '/var/run/elasticsearch-es-02.pid'
        when 'Debian'
          case fact('lsbmajdistrelease')
            when '7'
              test_settings['url']             = 'http://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-1.3.1.deb'
              test_settings['local']           = '/tmp/elasticsearch-1.3.1.deb'
              test_settings['puppet']          = 'elasticsearch-1.3.1.deb'
              test_settings['pid_file_a']      = '/var/run/elasticsearch-es-01.pid'
              test_settings['pid_file_b']      = '/var/run/elasticsearch-es-02.pid'
            else
              test_settings['url']             = 'http://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-1.3.1.deb'
              test_settings['local']           = '/tmp/elasticsearch-1.3.1.deb'
              test_settings['puppet']          = 'elasticsearch-1.3.1.deb'
              test_settings['pid_file_a']      = '/var/run/elasticsearch/elasticsearch-es-01.pid'
              test_settings['pid_file_b']      = '/var/run/elasticsearch/elasticsearch-es-02.pid'
          end
      end
      test_settings['package_name']    = 'elasticsearch'
      test_settings['service_name_a']  = 'elasticsearch-es-01'
      test_settings['service_name_b']  = 'elasticsearch-es-02'
      test_settings['defaults_file_a'] = '/etc/default/elasticsearch-es-01'
      test_settings['defaults_file_b'] = '/etc/default/elasticsearch-es-02'
      test_settings['port_a']          = '9200'
      test_settings['port_b']          = '9201'
    when 'Suse'
      test_settings['url']             = 'http://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-1.3.1.noarch.rpm'
      test_settings['local']           = '/tmp/elasticsearch-1.3.1.noarch.rpm'
      test_settings['puppet']          = 'elasticsearch-1.3.1.noarch.rpm'
      test_settings['package_name']    = 'elasticsearch'
      test_settings['service_name_a']  = 'elasticsearch-es-01'
      test_settings['service_name_b']  = 'elasticsearch-es-02'
      test_settings['pid_file_a']      = '/var/run/elasticsearch/elasticsearch-es-01.pid'
      test_settings['pid_file_b']      = '/var/run/elasticsearch/elasticsearch-es-02.pid'
      test_settings['defaults_file_a'] = '/etc/sysconfig/elasticsearch-es-01'
      test_settings['defaults_file_b'] = '/etc/sysconfig/elasticsearch-es-02'
      test_settings['port_a']          = '9200'
      test_settings['port_b']          = '9201'
  end

  test_settings['datadir_1'] = '/var/lib/elasticsearch-data/1/'
  test_settings['datadir_2'] = '/var/lib/elasticsearch-data/2/'
  test_settings['datadir_3'] = '/var/lib/elasticsearch-data/3/'

  test_settings['template'] = {
    "template" => "logstash-*",
    "settings" => {
      "index" => {
        "refresh_interval" => "5s",
        "analysis" => {
          "analyzer" => {
            "default" => {
              "type" => "standard",
              "stopwords" => "_none_"
            }
          }
        }
      }
    },
    "mappings" => {
      "_default_" => {
        "_all" => {"enabled" => true},
        "dynamic_templates" => [ {
          "string_fields" => {
            "match" => "*",
            "match_mapping_type" => "string",
            "mapping" => {
              "type" => "multi_field",
              "fields" => {
                "{name}" => {
                  "type"=> "string", "index" => "analyzed", "omit_norms" => true
                },
                "raw" => {
                  "type"=> "string", "index" => "not_analyzed", "ignore_above" => 256
                }
              }
            }
          }
        } ],
        "properties" => {
          "@version"=> { "type"=> "string", "index"=> "not_analyzed" },
          "geoip"  => {
            "type" => "object",
            "dynamic"=> true,
            "path"=> "full",
            "properties" => {
              "location" => { "type" => "geo_point" }
            }
          }
        }
      }
    }
  }

RSpec.configuration.test_settings = test_settings
