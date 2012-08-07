var engine;
$(document).ready( function(){

    var world  = new World();

    var step   = function () {

        var velocity          =                 vec2.create();
        var separation        =                 vec2.create();
        var alignment         =                 vec2.create();
        var cohesion          =                 vec2.create();
        var cDim              = this.world.renderer.canvasDim;
        var padding           = this.world.renderer.borderPad;
        var neighbours        =                             0;
        var neighboursTooNear =                             0;
        var bodies            =             this.world.bodies;
        var                                      mag, body, d;

        for ( var i = 0; i < bodies.length ; i++ ) {

            body =                               bodies[ i ];
            d    = vec2.dist( this.position, body.position );

            // Is a Neighbour
            if ( d <= this.__threshold && this != body ) {
                neighbours++;

                vec2.add(  cohesion, body.position,  cohesion );
                vec2.add( alignment, body.velocity, alignment );

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

            vec2.scale( separation, 1 / neighboursTooNear, separation );
            vec2.scale( separation,           this.__sepF, separation );

        }

        var outOfBounds = ( this.position[0] <               padding || 
                            this.position[0] > ( cDim[0] - padding ) ||
                            this.position[1] <               padding ||
                            this.position[1] > ( cDim[1] - padding ) );

        if ( outOfBounds ) {
            var rebound = vec2.create();

            vec2.scale(       cDim,          1 / 2,  rebound );
            vec2.subtract(  rebound, this.position,  rebound );
            vec2.add(      velocity,       rebound, velocity );

        }

        vec2.add( velocity, separation, velocity );
        vec2.add( velocity,  alignment, velocity );
        vec2.add( velocity,   cohesion, velocity );

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

    };

    var ent;
    for ( i = 0; i < 300; i++ ) {
        ent = new Entity();

        ent.addStepFunction( step );
        world.addEntity(      ent );

    }

    var c  = $( "#canvas" ).get( 0 );

    try {

        engine = new WebGLRenderEngine(  c, world );

    }
    catch( e ) {
        console.log( "reverting", e );
        //engine = new CanvasRenderEngine( c, world );

    }

} );