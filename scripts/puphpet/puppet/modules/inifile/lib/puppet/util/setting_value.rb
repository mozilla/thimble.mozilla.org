module Puppet
  module Util
    # This class can work with a list of subsettings inside
    # an ini file setting string to add, remove, extract and set their values.
    class SettingValue

      # The constructor method
      # @param setting_value [String] The initial setting value
      # @param subsetting_separator [String] The character is used to separate
      # subsettings in the setting_value string.
      # @param default_quote_char [String] Quote the setting string with this character.
      def initialize(setting_value, subsetting_separator = ' ', default_quote_char = '', key_val_separator = '')
        @setting_value = setting_value
        @subsetting_separator = subsetting_separator
        @quote_char = default_quote_char
        @key_val_separator = key_val_separator
        @subsetting_items = []

        if @setting_value
          unquoted, quote_char = unquote_setting_value(setting_value)
          @quote_char = quote_char unless quote_char.empty?
          # an item can contain escaped separator
          @subsetting_items = unquoted.scan(Regexp.new("(?:(?:[^\\#{@subsetting_separator}]|\\.)+)"))
          @subsetting_items.map! { |item| item.strip }
        end
      end

      # If the setting value is quoted, the quotes are
      # removed and the unquoted string and the quoting
      # character are returned.
      # @param setting_value [String] The input value
      # @return [Array] The unquoted string and the quoting character
      def unquote_setting_value(setting_value)
        quote_char = ''
        if setting_value.start_with?('"') and setting_value.end_with?('"')
          quote_char = '"'
        elsif setting_value.start_with?("'") and setting_value.end_with?("'")
          quote_char = "'"
        end

        if quote_char != ''
          unquoted = setting_value[1, setting_value.length - 2]
        else
          unquoted = setting_value
        end

        [unquoted, quote_char]
      end

      # Get the resulting setting value by joining all the
      # subsettings, separator and quote characters.
      # @return [String]
      def get_value
        value = @subsetting_items.join @subsetting_separator
        @quote_char + value + @quote_char
      end

      # Get the value of the given subsetting item.
      # If the exact match is used the value will be true
      # if the item is found.
      # @param subsetting [String] The name of the subsetting to add.
      # @param use_exact_match [:true,:false] Should the full name match be used?
      # @return [nil,true,String]
      def get_subsetting_value(subsetting, use_exact_match=:false)
        index = find_subsetting(subsetting, use_exact_match)
        # the item is not found in the list
        return nil unless index
        # the exact match is set and the item is found, the value should be true
        return true if use_exact_match == :true
        item = @subsetting_items[index]
        item[(subsetting.length + @key_val_separator.length)..-1]
      end

      # Add a new subsetting item to the list of existing items
      # if such item is not already there.
      # @param subsetting [String] The name of the subsetting to add.
      # @param subsetting_value [String] The value of the subsetting.
      # It will be appended to the name.
      # @param use_exact_match [:true,:false] Should the full name match be used?
      # @param [Symbol] insert_type
      # @param [String,Integer] insert_value
      # @return [Array] The resulting subsettings list.
      def add_subsetting(subsetting, subsetting_value, use_exact_match=:false, insert_type=:end, insert_value=nil)
        index = find_subsetting(subsetting, use_exact_match)

        # update the existing values if the subsetting is found in the list
        return update_subsetting(subsetting, subsetting_value, use_exact_match) if index

        new_item = item_value(subsetting, subsetting_value)

        case insert_type
          when :start
            @subsetting_items.unshift(new_item)
          when :end
            @subsetting_items.push(new_item)
          when :before
            before_index = find_subsetting(insert_value, use_exact_match)
            if before_index
              @subsetting_items.insert(before_index, new_item)
            else
              @subsetting_items.push(new_item)
            end
          when :after
            after_index = find_subsetting(insert_value, use_exact_match)
            if after_index
              @subsetting_items.insert(after_index + 1, new_item)
            else
              @subsetting_items.push(new_item)
            end
          when :index
            before_index = insert_value.to_i
            before_index = @subsetting_items.length if before_index > @subsetting_items.length
            @subsetting_items.insert(before_index, new_item)
          else
            @subsetting_items.push(new_item)
        end

        @subsetting_items
      end

      # Update all matching items in the settings list to the new values.
      # @param subsetting [String] The name of the subsetting to add.
      # @param subsetting_value [String] The value of the subsetting.
      # @param use_exact_match [:true,:false] Should the full name match be used?
      # @return [Array] The resulting subsettings list.
      def update_subsetting(subsetting, subsetting_value, use_exact_match=:false)
        new_item = item_value(subsetting, subsetting_value)
        @subsetting_items.map! do |item|
          if match_subsetting?(item, subsetting, use_exact_match)
            new_item
          else
            item
          end
        end
      end

      # Find the first subsetting item matching the given name,
      # or, if the exact match is set, equal to the given name
      # and return its array index value. Returns nil if not found.
      # @param subsetting [String] The name of the subsetting to search.
      # @param use_exact_match [:true,:false] Look for the full string match?
      # @return [Integer, nil]
      def find_subsetting(subsetting, use_exact_match=:false)
        @subsetting_items.index do |item|
          match_subsetting?(item, subsetting, use_exact_match)
        end
      end

      # Check if the subsetting item matches the given name.
      # If the exact match is set the entire item is matched,
      # and only the item name and separator string if not.
      # @param item [String] The item value to check against the subsetting name.
      # @param subsetting [String] The subsetting name.
      # @param use_exact_match [:true,:false] Look for the full string match?
      # @return [true,false]
      def match_subsetting?(item, subsetting, use_exact_match=:false)
        if use_exact_match == :true
          item.eql?(subsetting)
        else
          item.start_with?(subsetting + @key_val_separator)
        end
      end

      # Remove all the subsetting items that match
      # the given subsetting name.
      # @param subsetting [String] The subsetting name to remove.
      # @param use_exact_match [:true,:false] Look for the full string match?
      # @return [Array] The resulting subsettings list.
      def remove_subsetting(subsetting, use_exact_match=:false)
        @subsetting_items.delete_if do |item|
          match_subsetting?(item, subsetting, use_exact_match)
        end
      end

      # The actual value of the subsetting item.
      # It's built from the subsetting name, its value and the separator
      # string if present.
      # @param subsetting [String] The subsetting name
      # @param subsetting_value [String] The value of the subsetting
      # @return [String]
      def item_value(subsetting, subsetting_value)
        (subsetting || '') + (@key_val_separator || '') + (subsetting_value || '')
      end

    end
  end
end
