class Request < ActiveRecord::Base
  attr_accessible :requestType, :response, :time, :twitterID
end
