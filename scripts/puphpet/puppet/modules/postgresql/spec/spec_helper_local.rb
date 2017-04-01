RSpec.configure do |c|
  c.mock_with :rspec

  c.include PuppetlabsSpec::Files
  c.after :each do
    PuppetlabsSpec::Files.cleanup
  end
end

# Convenience helper for returning parameters for a type from the
# catalogue.
def param(type, title, param)
  param_value(catalogue, type, title, param)
end
