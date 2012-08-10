var model;
$(document).ready( function(){

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

    var c  = $( "#canvas" ).get(  0 );
    model  =    new TwitterModel( c );

    //model.buildGraphFor( "GaryCole" );

    // Sample Graph:
    // 1: "Joe", 2: "Bloggs", 3. "Jane", 4. "Doe", 5. "John", 6. "Brown", 7. Ashok, 8. Menon, 9. Alex, 10. North, 11. Leon, 12. Byford, 13. Seb, 14. Nathan, 15. Atkinstall
    // 1->2, 1<-3, 1<-4, 4->2 5->6 5->3, 5->4, 6->7, 6->8, 6->9, 6->10, 7->8, 8->9, 10->9, 11->8, 11->7, 11->13, 12->11. 12->14, 13->12, 13->15, 12->15, 14->1, 4->13, 5->11

    /*model.updateGraph( "1", "2", -1 );
    model.updateGraph( "1", "3", -1 );
    model.updateGraph( "1", "4", +1 );
    model.updateGraph( "4", "2", -1 );
    model.updateGraph( "5", "6", -1 );
    model.updateGraph( "5", "3", -1 );
    model.updateGraph( "5", "4", -1 );
    model.updateGraph( "6", "7", -1 );
    model.updateGraph( "6", "8", -1 );
    model.updateGraph( "6", "9", -1 );
    model.updateGraph( "6", "10", -1 );
    model.updateGraph( "7", "8", -1 );
    model.updateGraph( "8", "9", -1 );
    model.updateGraph( "10", "9", -1 );
    model.updateGraph( "11", "8", -1 );
    model.updateGraph( "11", "7", -1 );
    model.updateGraph( "11", "13", -1 );
    model.updateGraph( "12", "11", -1 );
    model.updateGraph( "12", "14", -1 );
    model.updateGraph( "13", "12", -1 );
    model.updateGraph( "13", "15", -1 );
    model.updateGraph( "12", "15", -1 );
    model.updateGraph( "14", "1", -1 );
    model.updateGraph( "4", "13", -1 );
    model.updateGraph( "5", "11", -1 );

    model.names = { Joe: 1, Bloggs: 2, Jane: 3, Doe: 4, John: 5, Brown: 6, Ashok: 7, Menon: 8, Alex: 9, North: 10, Leon: 11, Byford: 12, Seb: 13, Nathan: 14, Atkinstall: 15 };

    model.tags  = { yrs2012: 5, yrshelp: 2, sapyrs: 1 };

    model.userTags = {

        Joe: { yrs2012: 1, yrshelp: 1 },
        Bloggs: { yrs2012: 1, sapyrs: 1 },
        Jane: { yrs2012: 1, yrshelp: 1 },
        Doe: { yrs2012: 1 },
        John: { yrs2012: 1 },
        Brown: {},
        Ashok: {},
        Menon: {},
        Alex: {},
        North: {},
        Leon: {},
        Byford: {},
        Seb: {},
        Nathan: {},
        Atkinstall: {}

    };*/

    model.startSimulation();
} );