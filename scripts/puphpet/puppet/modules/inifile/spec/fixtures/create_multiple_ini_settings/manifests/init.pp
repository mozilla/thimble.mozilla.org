class create_multiple_ini_settings {

$defaults = { 'path' => '/tmp/foo.ini' }
$example = {
  'section1' => {
    'setting1'  => 'value1',
    'settings2' => {
      'ensure' => 'absent'
    }
  }
}
create_ini_settings($example, $defaults)

}

