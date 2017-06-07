class Specinfra::Command::Windows::Base::File < Specinfra::Command::Windows::Base
  class << self
    def check_is_owned_by(file, owner)
      Backend::PowerShell::Command.new do
        exec "if((Get-Item '#{file}').GetAccessControl().Owner -match '#{owner}'
          -or ((Get-Item '#{file}').GetAccessControl().Owner -match '#{owner}').Length -gt 0){ exit 0 } else { exit 1 }"
      end
    end
  end
end


class Specinfra::Command::Base::File < Specinfra::Command::Base
  class << self
    def get_content(file)
      "cat '#{file}' 2> /dev/null || echo -n"
    end
  end
end
