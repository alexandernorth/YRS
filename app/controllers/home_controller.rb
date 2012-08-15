class HomeController < ApplicationController
  def index

  	if session.has_key?(:tokens)
  			Rails.logger.warn 'logged in'
  			client = Grackle::Client.new(:auth=>{
			  :type=>:oauth,
			  :consumer_key=>'l9tUlXD0IOoGhC9HnDJBA', :consumer_secret=>'9YZWGkxQJgieQ3Ta89mPE4xpXXhryEbRD9GS0WAt4',
			  :token=>session[:tokens][:token], :token_secret=>session[:tokens][:token_secret]
			})
  		@user = client.users.lookup? :user_id => session[:id]
  		@logged = true

  	else
  		@logged = false
  	end
  	respond_to do |format|
  		format.html
  	end
  end
end
	