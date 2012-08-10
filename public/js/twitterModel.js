function TwitterModel( canvas ) {
    
    this.allKnown =                                 new Array();
    this.graph    =                                          {};
    this.entities =                                          {};
    this.world    =                                 new World();
    this.engine   = new WebGLRenderEngine( canvas, this.world );
    this.centX    =               this.engine.viewportWidth / 2;
    this.centY    =              this.engine.viewportHeight / 2;

}

TwitterModel.prototype.buildGraphFor = function( user ) {

    this.currentLayer  =     new Array();
    this.layerScores   =     new Array();
    this.waitingLayers =              [];
    this.stackDepth    =               0;
    this.sampleWidth   = this.__topLevel;

    this.resolveIdFor( user, function( data ) {

        var curr_id        =   data.id_str;
        this.waitingLayers = [ [curr_id] ];
        this.allKnown.push(     curr_id  );

    }, this.iterateLayer );


};

TwitterModel.prototype.nextWaitingToExpand = function() {
    
    if ( this.waitingLayers[ this.stackDepth ] === undefined || 
         this.waitingLayers[ this.stackDepth ].length == 0    ) {

        this.stackDepth++;

        if( this.stackDepth > this.__maxDepth                   || 
            this.waitingLayers[ this.stackDepth ] === undefined  ) return null;

        this.sampleWidth = Math.floor( this.__topLevel * Math.pow( 2, -this.stackDepth ) );
    }

    return this.waitingLayers[ this.stackDepth ].shift();

};

TwitterModel.prototype.iterateLayer     = function() {


    this.generator = this.nextWaitingToExpand();

    if ( !this.generator ) {

        this.allKnown =   null;
        this.updateNameTable();

        return;
    }

    this.processFollowers(   this.generator, this.addToLayerWithScore( +1 ), function() {

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
        timeout  :                                                       5000,
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

TwitterModel.prototype.updateNameTable  = function() {

    var userIds   = Object.keys( this.graph ).join();
    this.names    =                               {};
    this.userTags =                               {};
    this.tags     =                               {};

    $.ajax( {

        url      :                      'http://api.twitter.com/1/users/lookup.json',
        dataType :                                                           'jsonp',
        data     : { user_id: userIds, stringify_ids: true, include_entities: true },
        context  :                                                              this,
        success  : function ( data ) {

            var elem;

            for ( var i = 0, l = data.length; i < l; i++ ) {

                elem = data[ i ];

                this.names[    elem.screen_name ] =                       elem.id_str;
                this.userTags[ elem.screen_name ] =                                {};
                var localTags                     = this.userTags[ elem.screen_name ];

                if ( elem.status ) {
                    var tags = elem.status.entities.hashtags;

                    var tag;
                    for( var j = 0, tL = tags.length; j < tL; j++ ) {
                        tag = tags[ j ].text;

                        if ( !this.tags[ tag ] ) this.tags[ tag ] = 0;
                        if ( !localTags[ tag ] ) localTags[ tag ] = 0;

                        this.tags[ tag ] += 1;
                        localTags[ tag ] += 1;

                    }

                }

            }

        },
        complete :                                              this.startSimulation,
        timeout  :                                                              5000,
        error    :        function( xhr, msg, error ) { console.log( msg, error ); }
        
    } );    

}

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

TwitterModel.prototype.mergeWithKnown = function( ids )  {
    
    var known = this.allKnown;
    for ( var i = 0, l = ids.length; i < l; i++ ) {

        known.push( ids[ i ] );

    }

};

TwitterModel.prototype.processCurrentLayer = function() {

    var mFloor      =                                Math.floor;
    var indices     =   this.sampleableIds( this.currentLayer );
    var valid       = { ids: new Array(), scores: new Array() };

    for( var i = 0, l = indices.length; i < l; i++ ) {

        valid.ids.push(     this.currentLayer[ indices[ i ] ] );
        valid.scores.push(  this.layerScores[  indices[ i ] ] );

    }

    this.mergeWithKnown( this.currentLayer );

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

    var k, entity;
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

};

TwitterModel.prototype.updateGraph = function(     from, to, score ) {
    
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

TwitterModel.prototype.startSimulation  = function() {

    var names = this.names;
    for ( var name in names ) {
        $( "#users > ul" ).append( "<li><a href=\'#\'>@" + name + "</a></li>" );
        this.addEntity( name );

    }

    var mRand  = Math.random;
    var mRound =  Math.round;

    var tags = this.tags, ent, color, colorStr;
    for ( var tag in tags ) {

        color    =         vec4.create( [ mRand()*0.80, mRand()*0.80, mRand()*0.80, 1.0 ] );

        colorStr = "style=\'color: rgb(" + mRound( 255*color[0] ) 
                                   + "," + mRound( 255*color[1] ) 
                                   + "," + mRound( 255*color[2] ) + ");\'";

        $( "#stream > ul" ).append( "<li><a href=\'#\' " + colorStr + ">#" + tag + "</a></li>" );

        ent          =                  new Entity();
        ent.position = [ ent.__tagSF + ( mRand() * this.centX - ent.__tagSF ) * 2 , 
                         ent.__tagSF + ( mRand() * this.centY - ent.__tagSF ) * 2  ];

        ent.name      =                     tag;
        ent.angle     =   mRand() * Math.PI / 2;
        ent.scale     = tags[ tag ]*ent.__tagSF;
        ent.color     =           vec4.create();
        ent.trueColor =                   color;

        vec4.multiply(

            vec4.scale( [ 1, 1, 1, 1 ], 0.80, [] ),
            vec4.scale(          color, 0.20, [] ),
            ent.color

        );

        this.world.addTag( ent );
    }

    var _this = this;

    $( "#users > ul li a" ).hover(  function() { _this.highlightUser(   this ); },
                                    function() { _this.unHighlightUser( this ); } );

};

TwitterModel.prototype.highlightUser   = function( obj ) {
    var name = $( obj ).get( 0 ).innerHTML.substr( 1 );
    var id   = this.names[                      name ];
    var ent  = this.entities[                     id ];

    ent.forceColor = vec4.create( [ 0.0, 0.0, 0.0, 1.0 ] );


};

TwitterModel.prototype.unHighlightUser = function( obj ) {
    var name = $( obj ).get( 0 ).innerHTML.substr( 1 );
    var id   = this.names[                      name ];
    var ent  = this.entities[                     id ];

    ent.forceColor = null;


};

TwitterModel.prototype.addEntity        = function( name ) {
    
    var ent             =       new Entity();
    var id              = this.names[ name ];
    ent.id              =                 id;
    ent.name            =               name;
    this.entities[ id ] =                ent;

    ent.addStepFunction(          this.step );
    ent.position = [ this.centX, this.centY ];
    ent.model    =                       this;
    ent.sway     =                          1;
    ent.scale    =                          1;

    this.world.addEntity(               ent );

};

TwitterModel.prototype.step             = function() {

    var velocity          =                     vec2.create();
    var separation        =                     vec2.create();
    var alignment         =                     vec2.create();
    var cohesion          =                     vec2.create();
    var interest          =                     vec2.create();
    var cDim              =     this.world.renderer.canvasDim;
    var padding           =     this.world.renderer.borderPad;
    var adjacentTags      =                                 0;
    var neighbours        =                                 0;
    var neighboursTooNear =                                 0;
    var sway              =                                 0;
    var popularTagCount   =                                 0;
    var uTags             =  this.model.userTags[ this.name ];
    var bodies            =                 this.world.bodies;
    var tags              =                   this.world.tags;
    var   scale, affinity, mag, body, tag, tagName, tCount, d;
    var subgraph          =       this.model.graph[ this.id ];
    var mPow              =                          Math.pow;
    var mRand             =                       Math.random;

    for ( var tagName in tags ) {
        tag = tags[ tagName ];

        d = vec2.dist( this.position, tag.position );

        if ( d <= this.__view ) {

            tCount = uTags[ tagName ];

            if( tCount ) {

                if ( tCount > popularTagCount ) {

                    popularTagCount =        tCount;
                    this.color      = tag.trueColor;

                }

                adjacentTags++;

                vec2.add(

                                                  interest, 
                    vec2.scale( tag.position, tCount, [] ),
                                                  interest

                );

            }

        }

    }

    for ( var i = 0; i < bodies.length ; i++ ) {

        body =                               bodies[ i ];
        d    = vec2.dist( this.position, body.position );

        // Is a Neighbour
        if ( d <= this.__threshold && this != body ) {
            neighbours++;

            if ( subgraph[ body.id ] ) {   sway += subgraph[ body.id ]; }

            affinity =                                             mPow( 2, body.sway );
            vec2.add(  cohesion, vec2.scale( body.position, affinity, [] ),  cohesion );

            vec2.add( alignment, vec2.scale( body.velocity, affinity, [] ), alignment );

            if ( d <= this.__personal ) {

                neighboursTooNear++;

                if ( d < this.__effectiveZero ) {

                    vec2.add(

                        [ ( Math.random() - 0.5 ) * 4 * this.__maxV, 
                          ( Math.random() - 0.5 ) * 4 * this.__maxV ],

                        separation, 
                        separation 
                    );

                } else {

                    vec2.add(

                        vec2.scale(

                            vec2.direction( 
                                this.position,  // To
                                body.position,  // From
                                []              // Container
                            ),

                            1 / d 
                        ),

                        separation, 
                        separation 
                    );

                }


            }

        }

    }

    if ( adjacentTags > 0 ) {

        // Interest

        vec2.scale(    interest, 1 / adjacentTags, interest );
        vec2.subtract( interest,    this.position, interest );
        mag =                         vec2.length( interest );
        mag =        Math.min( mag, 100 ) * this.__maxV / 100;

        vec2.scale(       interest,           mag, interest );
        vec2.subtract(    interest, this.velocity, interest );

        vec2.scale(       interest,   this.__intF, interest );

    }

    if ( neighbours > 0 ) {

        // Cohesion

        vec2.scale(    cohesion, 1 / neighbours, cohesion );
        vec2.subtract( cohesion,  this.position, cohesion );
        mag = vec2.length(                       cohesion );
        mag =      Math.min( mag, 100 ) * this.__maxV / 100;

        vec2.scale(    cohesion,            mag, cohesion );
        vec2.subtract( cohesion,  this.velocity, cohesion );

        //Alignment

        vec2.scale(  alignment, 1 / neighbours, alignment );

        if ( vec2.length(  cohesion ) > this.__maxF ) vec2.scale( vec2.normalize(  cohesion ), this.__maxF,  cohesion );
        if ( vec2.length( alignment ) > this.__maxF ) vec2.scale( vec2.normalize( alignment ), this.__maxF, alignment );

        vec2.scale(  cohesion, this.__cohF,  cohesion );
        vec2.scale( alignment, this.__aliF, alignment );

    }

    if ( neighboursTooNear > 0 ) {

        // Separation

        vec2.scale( separation, 1 / neighboursTooNear, separation );
        vec2.scale( separation,           this.__sepF, separation );

    }

    var outOfBounds = ( this.position[0] <               padding || 
                        this.position[0] > ( cDim[0] - padding ) ||
                        this.position[1] <               padding ||
                        this.position[1] > ( cDim[1] - padding ) );

    if ( outOfBounds ) {

        // Bounds check

        var rebound = vec2.create();

        vec2.scale(       cDim,          1 / 2,  rebound );
        vec2.subtract(  rebound, this.position,  rebound );
        vec2.add(      velocity,       rebound, velocity );

    }

    vec2.add( velocity,   interest, velocity );
    vec2.add( velocity, separation, velocity );
    vec2.add( velocity,  alignment, velocity );
    vec2.add( velocity,   cohesion, velocity );

    // Jolt

    if( velocity[0] == 0 && 
        velocity[1] == 0 ) vec2.add( velocity, [ mRand() * 3, mRand() * 3 ], velocity );

    if ( vec2.length( velocity ) > this.__maxV ) vec2.scale( vec2.normalize( velocity ), this.__maxV, velocity );

    vec2.add( 

        vec2.scale( this.velocity, 0.995, [] ),
        vec2.scale(      velocity, 0.005, [] ),
        this.velocity

    );

    vec2.add(       this.position, this.velocity, this.position );

    var angle  = Math.atan( this.velocity[1] / this.velocity[0] );
    if (this.velocity[0] < 0 )                   angle += Math.PI;

    this.angle =                                            angle;

    // Calculate sway:
    if      ( sway < 0 ) sway = 0;
    else if ( sway > 3 ) sway = 3;

    this.sway  =                           sway;
    scale      =           1 + sway * this.__sF;
    this.scale = 0.9 * this.scale + 0.1 * scale;

    // Default Colour

    if ( popularTagCount == 0 ) this.color = this.__color;

    // Selection Colour
    if ( this.forceColor  ) {

        this.oldColor =      this.color;
        this.color    = this.forceColor;

    } else if ( this.oldColor && !this.forceColor ) {

        this.color    =   this.oldColor;
        this.oldColor =            null;

    }

}    

TwitterModel.prototype.__topLevel       =   4;
TwitterModel.prototype.__maxDepth       =   2;