function CanvasRenderEngine( canvas, world ) {

    paper.install( window );

    this.canvas       =                                             canvas;
    this.canvasDim    =      vec2.create( [canvas.width, canvas.height ] );
    this.borderPad    =                                                 10;
    this.world        =                                              world;
    this.project      = new Project(                                     );
    this.view         = new View(                                 canvas );

    this.project.activate();

    world.renderer    =                      this;

    var body;
    for ( var i = 0; i < world.bodies.length; i++ ) {
        body          =                  world.bodies[ i ];
        vec2.scale( this.canvasDim, 1 / 2, body.position );
        body.path     = new Path(          this.__symSeg );

    }

    // Context aware call to RenderEngine.draw() onFrame, using closure.
    var _this         =                                        this;
    this.view.onFrame = function( e ) { _this.draw.call( _this, e ); };

}

CanvasRenderEngine.prototype.draw = function( e ) {

    var bodies = this.world.bodies;
    var               body, _angle;
    for ( var i = 0 ; i < bodies.length; i++ ) {

        body                 =                bodies[ i ];

        _angle               = body.angle * 180 / Math.PI;
        body.path.rotate(        _angle - body.oldAngle );
        body.path.fillColor  =                 body.color;
        body.path.position.x =           body.position[0];
        body.path.position.y =           body.position[1];
        body.oldAngle        =                     _angle;

        body.step();
    }

};



CanvasRenderEngine.prototype.__symSeg = new Array(

    new paper.Point(  0, -10 ),
    new paper.Point(  5,  10 ),
    new paper.Point( -5,  10 )

);