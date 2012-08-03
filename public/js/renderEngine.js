function RenderEngine( canvas, world ) {

    this.canvas       =                                   canvas;
    this.canvasDim    = new Point( canvas.width, canvas.height );
    this.world        =                                    world;
    this.project      =              new Project(              );
    this.view         =              new View(          canvas );

    this.project.activate();

    // Centralize initialized world

    world.renderer    =                        this;

    var body;
    for ( var i = 0; i < world.bodies.length; i++ ) {
        body = world.bodies[ i ];
        body.position = new Point( canvas.width  / 2, 
                                   canvas.height / 2 );

        body.draw( new Path( this.__symSeg ) );

    }

    // Context aware call to RenderEngine.draw() onFrame, using closure.
    var _this         =                                        this;
    this.view.onFrame = function( e ) { _this.draw.call( _this, e ); };

}

RenderEngine.prototype.draw = function( e ) {

    var bodies = this.world.bodies;
    for ( var i = 0 ; i < bodies.length; i++ ) { bodies[ i ].draw(); }

    this.world.step();

};



RenderEngine.prototype.__symSeg = new Array(

    new paper.Point(  0, -10 ),
    new paper.Point(  5,  10 ),
    new paper.Point( -5,  10 )

);