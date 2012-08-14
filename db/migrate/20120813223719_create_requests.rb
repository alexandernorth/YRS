class CreateRequests < ActiveRecord::Migration
  def change
    create_table :requests do |t|
      t.string :type
      t.integer :id
      t.time :time
      t.text :response

      t.timestamps
    end
  end
end
