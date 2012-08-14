class Request < ActiveRecord::Base
  attr_accessible :twitterID, :response, :time, :requestType
  def new?
    updated_at > 1.hour.ago
  end
end
