class FixIDcolumnName < ActiveRecord::Migration
def up
	rename_column :requests, :id,:twitterID
end


  def down
  end
end
