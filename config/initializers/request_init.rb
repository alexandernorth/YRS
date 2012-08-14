class Request < ActiveRecord::Base
  def new?
    created_at > 1.hour.ago
  end
end