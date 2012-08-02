function RenderEngine( canvas, world ) {

    this.canvas       =                      canvas;
    this.world        =                       world;
    this.project      = new Project(              );
    this.view         = new View(          canvas );

    this.project.activate();

    // Centralize initialized world

    world.renderer    =                        this;

    var body;
    for ( var i = 0; i < world.bodies.length; i++ ) {
        body = world.bodies[ i ];
        console.log( "shifting" );
        body.position = new Point( canvas.width  / 2, 
                                   canvas.height / 2 );

    }

    // Context aware call to RenderEngine.draw() onFrame, using closure.
    var _this         =                                      this;
    this.view.onFrame = function( e ) _this.draw.call( _this, e );

}

RenderEngine.prototype.draw = function( e ) {

    this.world.step();

    for ( var i = 0 ; i < this.world.bodies.length; i++ ) {
        
        this.world.bodies[ i ].draw( new Path( this.__symSeg ) );

    }

};



RenderEngine.prototype.__symSeg = new Array(

    new paper.Point(  0, -10 ),
    new paper.Point(  5,  10 ),
    new paper.Point( -5,  10 )

);