class puphpet::python::install
  inherits puphpet::python::params
{

  $python = $puphpet::params::hiera['python']

  anchor{ 'puphpet::python::init': }
  -> class { 'puphpet::python::pre': }
  -> class { '::pyenv':
    manage_packages => false,
  }

  puphpet::python::pyenv { 'from puphpet::python::install': }
  include ::puphpet::python::pip
  anchor{ 'puphpet::python::end': }

  $packages = array_true($python, 'packages') ? {
    true    => $python['packages'],
    default => { }
  }

  create_resources(puphpet::python::packages, { 'from puphpet::python::install' => {
    packages => $packages
  } })

}
