function RenderEngine( canvas, world ) {

    this.canvas       =                      canvas;
    this.world        =                       world;
    this.project      = new Project(              );
    this.view         = new View(          canvas );

    this.project.activate();

    // Centralize initialized world

    world.renderer    =                        this;

    for each ( body in world.bodies ) {
        
        body.position = new Point( canvas.width  / 2, 
                                   canvas.height / 2 );

    }

    // Context aware call to RenderEngine.draw() onFrame, using closure.
    var _this         =                                      this;
    this.view.onFrame = function( e ) _this.draw.call( _this, e );

}

RenderEngine.prototype.draw = function( e ) {

    this.world.step();

    for each ( entity in this.world.bodies ) entity.draw( new Path( this.__symSeg ) );

};



RenderEngine.prototype.__symSeg = new Array(

    new paper.Point(  0, -10 ),
    new paper.Point(  5,  10 ),
    new paper.Point( -5,  10 )

);