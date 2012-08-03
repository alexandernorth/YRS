function Entity() {
    
    this.position = new Point( 0, 0 );
    this.rotation =                 0;
    this.color    =         '#00A6EE';
    this.angle    =                 0;
    this.oldAngle =               -90;
    this.velocity = new Point( 0, 0 );
    this.targetV  = new Point( 0, 0 );

    this.step     = function() { return; };

}

Entity.prototype.addStepFunction = function( func ) {
    
    this.step = func;

};

Entity.prototype.draw = function( path ) {

    this.path           = ( this.path || path );

    this.velocity       = this.velocity.multiply( 0.99 ).add( 
                          this.targetV.multiply(  0.01 ) 
    );

    this.position       = this.position.add( this.velocity );
    this.angle          =                this.velocity.angle;

    this.path.rotate(                                this.angle - this.oldAngle );
    this.path.fillColor =                                              this.color;
    this.oldAngle       =                                              this.angle;

    var cDim            =                           this.world.renderer.canvasDim;
    this.path.position  = this.position.modulo( cDim ).add( cDim ).modulo( cDim );

};

Entity.prototype.__threshold = 80;
Entity.prototype.__personal  = 20;
Entity.prototype.__maxV      = 4;
Entity.prototype.__maxF      = 0.1;

Entity.prototype.__sepF      = 70;
Entity.prototype.__cohF      = 5;
Entity.prototype.__aliF      = 5;