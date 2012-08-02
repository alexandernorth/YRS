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
    return this.bodies.splice( i, 1 )[ 0 ];

};

World.prototype.step = function() {
    
    for each ( entity in this.bodies ) entity.step();

};