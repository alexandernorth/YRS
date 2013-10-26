
class SessionsController < ApplicationController
  def new

  end

## 
# Below is a template for implementing the "OAuth Dance" with Twitter using the Ruby OAuth gem in a Rails app.
# Ruby OAuth gem is required by grackle and is found here: http://github.com/oauth/oauth-ruby
## 

# Step 1: User clicks "Sign in with Twitter" button

# Step 2: User is routed to your controller action that looks like the method below

def start_oauth
  @consumer = OAuth::Consumer.new('l9tUlXD0IOoGhC9HnDJBA', '9YZWGkxQJgieQ3Ta89mPE4xpXXhryEbRD9GS0WAt4',{:site=>"http://twitter.com" })
  @req_token = @consumer.get_request_token(:oauth_callback=>"http://127.0.0.1:3000/a2")
  Rails.logger.warn "First Request #{@req_token.inspect}"
  session[:request_token] = @req_token.token
  session[:request_token_secret] = @req_token.secret
  redirect_to @req_token.authorize_url
end

# Step 3: User is taken to Twitter to authorize your application

# Step 4: User is redirected from Twitter to your URL which invokes the action below

def finish_oauth
	Rails.logger.warn 'here'

  @consumer = OAuth::Consumer.new('l9tUlXD0IOoGhC9HnDJBA', '9YZWGkxQJgieQ3Ta89mPE4xpXXhryEbRD9GS0WAt4',{:site=>"http://twitter.com" })
  @req_token = OAuth::RequestToken.new(@consumer,session[:request_token],session[:request_token_secret])
  
  # Request user access info from Twitter
  @access_token = @req_token.get_access_token

  # Store the OAuth info for the user
  #@user = {}
  #@user.update_attributes(:token=>@access_token.token,:token_secret=>@access_token.secret)
  Rails.logger.warn "Second Request #{@access_token.params['user_id']}"
  # Send the user on their way
  session[:tokens] ={:token=>@access_token.token, :token_secret=>@access_token.secret}
  session[:id] = @access_token.params['user_id']
  redirect_to '/'
end
  def failure
  end
def logout
	[:tokens,:request_token,:request_token_secret,:id].each{|key| session.delete(key)}
	redirect_to '/'
end	
	

end
