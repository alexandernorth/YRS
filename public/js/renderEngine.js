function RenderEngine( canvas, world ) {

    this.canvas       =                                             canvas;
    this.canvasDim    = new Rectangle( 0, 0, canvas.width, canvas.height );
    this.traversible  = new Rectangle(                    this.canvasDim );
    this.world        =                                              world;
    this.project      = new Project(                                     );
    this.view         = new View(                                 canvas );

    this.project.activate();

    this.traversible.size  = this.traversible.size.subtract( 20 );
    this.traversible.point = this.traversible.point.add(     10 );

    world.renderer    =                        this;

    var body;
    for ( var i = 0; i < world.bodies.length; i++ ) {
        body          =      world.bodies[ i ];
        body.position =  this.canvasDim.center;

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