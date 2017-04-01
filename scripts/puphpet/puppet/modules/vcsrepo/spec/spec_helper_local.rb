require 'support/filesystem_helpers'
require 'support/fixture_helpers'

RSpec.configure do |c|
  c.include FilesystemHelpers
  c.include FixtureHelpers
end
