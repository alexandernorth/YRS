function Entity() {
    
    this.position =                         vec2.create();
    this.color    = vec4.create( [0.0, 0.65, 0.93, 1.0] );
    this.angle    =                                     0;
    this.oldAngle =                                   -90;
    this.velocity =                         vec2.create();

    this.step     = function() { return; };

}

Entity.prototype.addStepFunction = function( func ) {
    
    this.step = func;

};

Entity.prototype.__threshold     =  40;
Entity.prototype.__personal      =  20;
Entity.prototype.__effectiveZero = 0.5;
Entity.prototype.__maxV          =   5;
Entity.prototype.__maxF          = 0.1;

Entity.prototype.__sepF          =  70;
Entity.prototype.__cohF          =   5;
Entity.prototype.__aliF          =   5;