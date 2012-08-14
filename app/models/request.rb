class Request < ActiveRecord::Base
  attr_accessible :requestType, :response, :time, :twitterID
  def old?
  	updated_at > 1.hour.ago
  end
end
