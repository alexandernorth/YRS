class RequestsController < ApplicationController
	def main
		Rails.logger.warn params.inspect

		def handleRequest
			client = Grackle::Client.new(:auth=>{
				  :type=>:oauth,
				  :consumer_key=>'l9tUlXD0IOoGhC9HnDJBA', :consumer_secret=>'9YZWGkxQJgieQ3Ta89mPE4xpXXhryEbRD9GS0WAt4',
				  :token=>session[:tokens][:token], :token_secret=>session[:tokens][:token_secret]
				})
			case params[:type]
			when 'friends'
				req = client.friends.ids? :stringify_ids => true, :user_id => params[:id]
			when 'followers'
				req = client.followers.ids? :stringify_ids => true, :user_id => params[:id]
			end
			YAML::dump(req.ids)
		end	

		find = Request.where(:twitterID => params[:id], :requestType => params[:type])
		if !find.empty?
			record=find.first
			if !record.old?
				Rails.logger.info 'Updating'
				record.time = Time.new
				record.response = handleRequest
				record.save
			else
				Rails.logger.info 'New Enough'
			end
		else
			Rails.logger.info 'Creating New'
			record = Request.new(:twitterID => params[:id], :requestType => params[:type], :time => Time.new, :response => handleRequest)
			record.save
		end
		render :json => {'ids' => YAML::load(record.response)}.to_json, :callback => params[:callback]
	end
end
