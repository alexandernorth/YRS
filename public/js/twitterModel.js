function TwitterModel( canvas ) {
    
    this.allKnown = new Array();
    this.graph    = new Array();
    this.world    = new World();

}

TwitterModel.prototype.buildGraphFor = function( user ) {

    this.currentLayer = new Array();
    this.layerScores  = new Array();

    this.resolveIdFor( user, function( data ) {
        var curr_id =  data.id_str;
        this.graph.push( curr_id );

        this.processFollowers( curr_id, function( data ) {

            var ids = data.ids;

            var id, index;
            for ( var i = 0, l = ids.length; i < l; i++ ) {

                id    =                        ids[ i ];
                index = this.currentLayer.indexOf( id );

                if ( index == -1 ) {

                    this.currentLayer.push(   id );
                    this.layerScores.push(     1 );

                }
                else {

                    this.layerScores[ index ] += 1;

                }

            }

            this.processFriends( curr_id, function( data ) {

                var ids = data.ids;

            var id, index;
            for ( var i = 0, l = ids.length; i < l; i++ ) {

                id    =                        ids[ i ];
                index = this.currentLayer.indexOf( id );

                if ( index == -1 ) {

                    this.currentLayer.push(   id );
                    this.layerScores.push(    -1 );

                }
                else {

                    this.layerScores[ index ] -= 1;

                }

            }

            }, this.processCurrentLayer );

        } );

    } );


};

TwitterModel.prototype.resolveIdFor     = function(   user, callback, after ) {

    $.ajax( {

        url      :                 'http://api.twitter.com/1/users/show.json',
        dataType :                                                    'jsonp',
        data     :                 { screen_name: user, stringify_ids: true },
        context  :                                                       this,
        success  :                                                   callback,
        complete :                                                      after,
        error    : function( xhr, msg, error ) { console.log( msg, error ); }

    } );

};

TwitterModel.prototype.processFollowers = function( userId, callback, after ) {
    
    $.ajax( {

        url      :              'http://api.twitter.com/1/followers/ids.json',
        dataType :                                                    'jsonp',
        data     :                   { user_id: userId, stringify_ids: true },
        context  :                                                       this,
        success  :                                                   callback,
        complete :                                                      after,
        error    : function( xhr, msg, error ) { console.log( msg, error ); }

    } );

};

TwitterModel.prototype.processFriends   = function( userId, callback, after ) {
    
    $.ajax( {

        url      :                'http://api.twitter.com/1/friends/ids.json',
        dataType :                                                    'jsonp',
        data     :                   { user_id: userId, stringify_ids: true },
        context  :                                                       this,
        success  :                                                   callback,
        complete :                                                      after,
        error    : function( xhr, msg, error ) { console.log( msg, error ); }
        
    } );

};

TwitterModel.prototype.processCurrentLayer = function() {
    
    console.log( "Finished getting all the items in the currentlayer, now I'm going to process it" );
    console.log( this.currentLayer );
    console.log( this.layerScores );

};

TwitterModel.prototype.sample           = function(     ids, count ) {
    
    var totalLength   =         ids.length;

    if ( totalLength <= count ) return ids;

    var mFloor  = Math.floor, mRand = Math.random;
    var sample  =                     new Array();
    var indices =                     new Array();
    var newIndex;

    while( indices.length < count ) {

        newIndex = mFloor( mRand() * totalLength );
        if( indices.indexOf( newIndex ) == -1 ) {

            indices.push(     newIndex   );
            sample.push( ids[ newIndex ] );

        }

    }

    return sample;

};

TwitterModel.prototype.sampleableIds    = function(            ids ) {
    
    var sampleable =   new Array();
    var graph      =    this.graph;
    var known      = this.allKnown;

    var id;
    for( var i = 0, l = ids.length; i < l; i++ ) {
        id = ids[ i ];

        if ( graph.indexOf(  id ) != -1 || 
             known.indexOf(  id ) == -1  ) {

            sampleable.push( id );

        }
    }

    return sampleable;
};

TwitterModel.prototype.__topLevel       =   4;
TwitterModel.prototype.__maxDepth       =   2;