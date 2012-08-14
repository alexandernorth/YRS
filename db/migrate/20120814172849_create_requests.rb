class CreateRequests < ActiveRecord::Migration
  def change
    create_table :requests do |t|
      t.string :requestType
      t.integer :twitterID
      t.text :response
      t.time :time

      t.timestamps
    end
  end
end
