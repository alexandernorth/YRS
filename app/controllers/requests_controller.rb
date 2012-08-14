class RequestsController < ApplicationController
	def main
		client = Grackle::Client.new(:auth=>{
			  :type=>:oauth,
			  :consumer_key=>'l9tUlXD0IOoGhC9HnDJBA', :consumer_secret=>'9YZWGkxQJgieQ3Ta89mPE4xpXXhryEbRD9GS0WAt4',
			  :token=>session[:tokens][:token], :token_secret=>session[:tokens][:token_secret]
			})
		n = Request.new(:twitterID => 123, :requestType => 'friends', :time => Time.new, :response => 'aaa')
		n.save
		render :text => n.inspect
	end
end
