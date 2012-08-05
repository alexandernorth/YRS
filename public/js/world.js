function World() {
    
    this.bodies = new Array();

}

World.prototype.addEntity = function( entity ) {
    
    entity.world   =               this;
    entity.worldId = this.bodies.length;
    this.bodies.push(          entity );

};

World.prototype.removeEntity = function( i ) {

    this.bodies[ i ].world   =        null;
    this.bodies[ i ].worldId =        null;
    return this.bodies.splice( i, 1 )[ 0 ];

};

World.prototype.step = function() {
    
    for ( var i = 0; i < this.bodies.length; i++ ) this.bodies[ i ].step();

};