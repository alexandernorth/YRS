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

    this.velocity       = this.velocity.multiply( 0.9 ).add( 
                          this.targetV.multiply(  0.1 ) 
    );

    this.position       = this.position.add( this.velocity );
    this.angle          =                this.velocity.angle;

    this.path.rotate( this.angle - this.oldAngle );
    this.path.position  =            this.position;
    this.path.fillColor =               this.color;
    this.oldAngle       =               this.angle;

};

Entity.prototype.__threshold =  80;
Entity.prototype.__personal  =  25;
Entity.prototype.__maxV      =   1;