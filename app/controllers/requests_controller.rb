class RequestsController < ApplicationController
	def main

		def handleRequest
			client = Grackle::Client.new(:auth=>{
				:type=>:oauth,
				:consumer_key=>'l9tUlXD0IOoGhC9HnDJBA',
				:consumer_secret=>'9YZWGkxQJgieQ3Ta89mPE4xpXXhryEbRD9GS0WAt4',
				:token=>session[:tokens][:token],
				:token_secret=>session[:tokens][:token_secret],	
			})
			case params[:type]	
				when 'friends'
					response = client.friends.ids? :user_id => params[:id], :stringify_ids => true
				when 'followers'
					response = client.followers.ids? :user_id => params[:id], :stringify_ids => true
			end
			return YAML::dump(response.ids)
		end

 
		if ['friends','followers'].include? params[:type]  and !!(params[:id] =~ /^[-+]?[0-9]+$/)
			search = Request.where(:requestType => params[:type], :twitterID => params[:id].to_i)
			Rails.logger.warn search.first
			if !search.empty?
				request = search.first
				Rails.logger.warn YAML::load(request.response)
				if !request.new?
					Rails.logger.warn "Updating record"
					request.time = Time.new
					request.response = handleRequest
					request.save
				Rails.logger.warn "Third Request #{request.inspect}"
				end
			else
				request = Request.new(:requestType => params[:type], :twitterID => params[:id].to_i, :time => Time.new, :response => handleRequest)
				request.save
			end

			render :json => request.response.to_json, :callback => params[:callback]
		else
			render :text => 'Invalid request URL'
		end
	end
end
