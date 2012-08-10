function World() {
    
    this.bodies = new Array();
    this.tags   =          {};

}

World.prototype.addTag = function( tag ) {

    tag.world             =               this;
    tag.worldId           =   this.tags.length;
    this.tags[ tag.name ] =                tag;

};

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