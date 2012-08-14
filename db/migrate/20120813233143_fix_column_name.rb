class FixColumnName < ActiveRecord::Migration
  def up
  	rename_column :requests, :type, :requestType
  end

  def down
  end
end
