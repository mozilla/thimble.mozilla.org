require 'spec_helper'
# end-to-end test of the create_init_settings function
describe 'create_ini_settings_test' do
  it { should have_ini_setting_resource_count(3) }
  it { should contain_ini_setting('/tmp/foo.ini [section1] setting1').with(
    :ensure  => 'present',
    :section => 'section1',
    :setting => 'setting1',
    :value   => 'val1',
    :path    => '/tmp/foo.ini'
  )}
  it { should contain_ini_setting('/tmp/foo.ini [section2] setting2').with(
    :ensure  => 'present',
    :section => 'section2',
    :setting => 'setting2',
    :value   => 'val2',
    :path    => '/tmp/foo.ini'
  )}
  it { should contain_ini_setting('/tmp/foo.ini [section2] setting3').with(
    :ensure  => 'absent',
    :section => 'section2',
    :setting => 'setting3',
    :path    => '/tmp/foo.ini'
  )}
end
