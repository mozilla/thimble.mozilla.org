# This should repo the scope error from github issue #1
class issue1 {
  datacat { "/tmp/issue1.1":
    template => "issue1/refers_to_scope.erb",
  }
}
