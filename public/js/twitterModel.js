function TwitterModel( canvas ) {
    
    this.allKnown = new Array();
    this.graph    =          {};
    this.world    = new World();

}

TwitterModel.prototype.buildGraphFor = function( user ) {

    this.currentLayer  =     new Array();
    this.layerScores   =     new Array();
    this.stackDepth    =               0;
    this.sampleWidth   = this.__topLevel;

    this.resolveIdFor( user, function( data ) {

        var curr_id        =   data.id_str;
        this.waitingLayers = [ [curr_id] ];

    }, this.iterateLayer );


};

TwitterModel.prototype.nextWaitingToExpand = function() {
    
    if ( this.waitingLayers[ this.stackDepth ].length == 0 ) {

        this.stackDepth++;

        if( this.stackDepth > this.__maxDepth ) return null;

        this.sampleWidth = Math.floor( this.__topLevel * Math.pow( 2, -this.stackDepth ) );
    }

    return this.waitingLayers[ this.stackDepth ].shift();

};

TwitterModel.prototype.iterateLayer     = function() {


    this.generator = this.nextWaitingToExpand();

    if ( !this.generator ) {
        console.log( "Finished Generating" );
        return;
    }

    this.processFollowers(   this.generator, this.addToLayerWithScore( +1 ), function() {
        console.log( "Completed Processing Followers, moving on" );
        this.processFriends( this.generator, this.addToLayerWithScore( -1 ), [ this.processCurrentLayer, this.iterateLayer ] );

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
        timeout  :                                                       5000,
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
        timeout  :                                                       5000,
        error    : function( xhr, msg, error ) { console.log( msg, error ); }
        
    } );

};

TwitterModel.prototype.addToLayerWithScore = function( score ) {
    
    return function( data ) {
        var ids = data.ids;

        var id, index;
        for ( var i = 0, l = ids.length; i < l; i++ ) {

            id    =                        ids[ i ];
            index = this.currentLayer.indexOf( id );

            if ( index == -1 ) {

                this.currentLayer.push(       id );
                this.layerScores.push(     score );

            } else {

                this.layerScores[ index ] += score;

            }

        }

    };

};

TwitterModel.prototype.processCurrentLayer = function() {

    var mFloor      =                                Math.floor;
    var indices     =   this.sampleableIds( this.currentLayer );
    var valid       = { ids: new Array(), scores: new Array() };

    for( var i = 0, l = indices.length; i < l; i++ ) {

        valid.ids.push(     this.currentLayer[ indices[ i ] ] );
        valid.scores.push(  this.layerScores[  indices[ i ] ] );

    }

    var friendsC   = 0;
    var followersC = 0;
    var bothC      = 0;

    var friend   = { ids: new Array(), scores: new Array() };
    var follower = { ids: new Array(), scores: new Array() }; 
    var both     = { ids: new Array(), scores: new Array() }; 

    var score;
    for ( var i = 0, l = valid.scores.length; i < l; i++ ) {
        score = valid.scores[ i ];

        if      ( score ==  0 ) { 

            bothC      += 1;

            both.ids.push(    valid.ids[    i ] );
            both.scores.push(             score );

        }
        else if ( score ==  1 ) { 

            followersC += 1;

            follower.ids.push(    valid.ids[    i ] );
            follower.scores.push(             score );

        }
        else if ( score == -1 ) {

            friendsC   += 1; 

            friend.ids.push(    valid.ids[    i ] );
            friend.scores.push(             score );

        }

    }

    var total          =                                                friendsC + followersC + bothC;

    var friendSample   = this.sample( friend.ids,   mFloor( this.sampleWidth * friendsC   / total ) );
    var followerSample = this.sample( follower.ids, mFloor( this.sampleWidth * followersC / total ) );
    var bothSample     = this.sample( both.ids,     mFloor( this.sampleWidth * bothC      / total ) );

    var entities       =                                                                  new Array();

    var k;
    for( var i = 0, l =   friendSample.length; i < l; i++ ) {
        k     = friendSample[  i ];
        id    = friend.ids[    k ];
        score = friend.scores[ k ];

        this.allKnown.push(                      id );
        entities.push(                           id );
        this.updateGraph( this.generator, id, score );

    }

    for( var i = 0, l = followerSample.length; i < l; i++ ) {
        k     = followerSample[  i ];
        id    = follower.ids[    k ];
        score = follower.scores[ k ];

        this.allKnown.push(                      id );
        entities.push(                           id );
        this.updateGraph( this.generator, id, score );
    }

    for( var i = 0, l =     bothSample.length; i < l; i++ ) {
        k     = bothSample[  i ];
        id    = both.ids[    k ];
        score = both.scores[ k ];

        this.allKnown.push(                      id );
        entities.push(                           id );
        this.updateGraph( this.generator, id, score );

    }

    if ( ( this.stackDepth + 1 ) <= this.__maxDepth ) {

        if ( this.waitingLayers[ this.stackDepth + 1 ] === undefined ) {
            this.waitingLayers[  this.stackDepth + 1 ] = new Array();
        }


        this.waitingLayers[ this.stackDepth + 1] = this.waitingLayers[ this.stackDepth + 1].concat( entities );
    }

    console.log( "graph", this.allKnown, "\n", this.graph );
    console.log( "waiting layers", this.waitingLayers );
};

TwitterModel.prototype.updateGraph = function( from, to, score ) {
    
    if ( !this.graph[ from ] ) this.graph[ from ] = {};
    if ( !this.graph[   to ] ) this.graph[   to ] = {};

    this.graph[ from ][   to ] =  score;
    this.graph[   to ][ from ] = -score;

};

TwitterModel.prototype.sample           = function(     ids, count ) {
    
    var totalLength   =         ids.length;

    if ( totalLength <= count ) return ids;

    var mFloor  = Math.floor, mRand = Math.random;
    var indices =                     new Array();
    var newIndex;

    while( indices.length < count ) {

        newIndex = mFloor( mRand() * totalLength );
        if( indices.indexOf( newIndex ) == -1 ) {

            indices.push(    newIndex );

        }

    }

    return indices;

};

TwitterModel.prototype.sampleableIds    = function(            ids ) {
    
    var sampleable =   new Array();
    var graph      =    this.graph;
    var known      = this.allKnown;

    var id;
    for( var i = 0, l = ids.length; i < l; i++ ) {
        id = ids[ i ];

        if ( graph[          id ]       || 
             known.indexOf(  id ) == -1  ) {

            sampleable.push( i );

        }
    }

    return sampleable;
};

TwitterModel.prototype.__topLevel       =   4;
TwitterModel.prototype.__maxDepth       =   2;