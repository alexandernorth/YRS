function WebGLRenderEngine( canvas, world ) {

    var gl              = canvas.getContext( "experimental-webgl" );

    this.gl             =                                             gl;
    this.canvasDim      = vec2.create( [ canvas.width, canvas.height ] );
    this.borderPad      =                                             10;
    this.world          =                                          world;
    this.viewportWidth  =                                   canvas.width;
    this.viewportHeight =                                  canvas.height;

    if( !this.gl )                          throw new NoWebGLException();

    world.renderer      =                                           this;

    this.projectionMat  =                                  mat4.create();
    this.vertexBuff     =                              gl.createBuffer();

    gl.bindBuffer(               gl.ARRAY_BUFFER, this.vertexBuff );
    gl.bufferData(   gl.ARRAY_BUFFER, this.__vert, gl.STATIC_DRAW );

    mat4.ortho(                                  0,  canvas.width, 
                                                 0, canvas.height, 
                                                         0.1, 100, 
                                               this.projectionMat );

    var shaderProgram   =                        gl.createProgram();
    var vertexShader    =        this.fetchShader( "vertexShader" );
    var fragmentShader  =        this.fetchShader(   "fragShader" );

    gl.attachShader(                shaderProgram,   vertexShader );
    gl.attachShader(                shaderProgram, fragmentShader );

    gl.linkProgram(                                 shaderProgram );

    if ( !gl.getProgramParameter( shaderProgram, gl.LINK_STATUS ) ) {

        throw new ShaderLoadFailed();

    }

    gl.useProgram(                                          shaderProgram );

    this.vertexAttrib       = gl.getAttribLocation(  shaderProgram,  "aVertex" );
    this.translationUniform = gl.getUniformLocation( shaderProgram, "uTMatrix" );
    this.rotationUniform    = gl.getUniformLocation( shaderProgram, "uRMatrix" );
    this.projectionUniform  = gl.getUniformLocation( shaderProgram, "uPMatrix" );
    this.colorUniform       = gl.getUniformLocation( shaderProgram,   "uColor" );

    gl.enableVertexAttribArray(                         this.vertexAttrib );

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    //gl.enable(          gl.DEPTH_TEST );

    var bodies = this.world.bodies;
    var body;

    for( var i = 0; i < bodies.length; i++ ) {
        body   = bodies[ i ];

        vec2.set( [ canvas.width / 2, canvas.height / 2 ], body.position );

    }

    var _this = this;
    requestAnimationFrame( function( t ) { _this.draw.call( _this, t ); } );
}

WebGLRenderEngine.prototype.fetchShader = function( id ) {

    var gl   =                       this.gl;

    var elem = document.getElementById( id );
    if( !elem ) throw new ShaderLoadFailed();

    var content = "";
    var child   = elem.firstChild;

    while( child ) {

        if ( child.nodeType == 3 ) content += child.textContent;
        child                               = child.nextSibling;

    }

    var shader;
    if      ( elem.type == "x-shader/x-fragment" ) { shader = gl.createShader( gl.FRAGMENT_SHADER ); }
    else if ( elem.type ==   "x-shader/x-vertex" ) { shader = gl.createShader(   gl.VERTEX_SHADER ); }
    else                                           { throw                   new ShaderLoadFailed(); }

    gl.shaderSource( shader, content );
    gl.compileShader(         shader );

    if ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {

        console.log( gl.getShaderInfoLog( shader ) );
        throw                 new ShaderLoadFailed();

    }

    return shader;
}

WebGLRenderEngine.prototype.draw   = function( time ) {

    var gl             =                                           this.gl;
    var rotationMat    =                                     mat4.create();
    var translationMat =                                     mat4.create();

    gl.viewport(         0, 0, this.viewportWidth, this.viewportHeight );
    gl.clear(                gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    gl.bindBuffer(                    gl.ARRAY_BUFFER, this.vertexBuff );

    gl.vertexAttribPointer(        this.vertexAttrib, this.__vertWidth, 
                                                 gl.FLOAT, false, 0, 0 );

    var bodies = this.world.bodies;
    var body;

    for ( var i = 0; i < bodies.length; i++ ) {
        body = bodies[ i ];
        
        body.step();

        mat4.identity(                                                   rotationMat );
        mat4.identity(                                                translationMat );
        mat4.translate( translationMat, [ body.position[0], body.position[1], -1.0 ] );
        mat4.rotateZ(                                        rotationMat, body.angle );
        gl.uniformMatrix4fv(                this.rotationUniform, false, rotationMat );
        gl.uniformMatrix4fv(          this.translationUniform, false, translationMat );
        gl.uniformMatrix4fv(       this.projectionUniform, false, this.projectionMat );
        gl.uniform4fv(                                 this.colorUniform, body.color );
        gl.drawArrays(                        gl.TRIANGLE_STRIP, 0, this.__vertCount );

    }

    var _this = this;
    requestAnimationFrame( function( t ) { _this.draw( t ); } );
};


WebGLRenderEngine.prototype.__vert = new Float32Array( [

     /*10.0,  0.0, 0.0,
    -10.0,  5.0, 0.0,
    -10.0, -5.0, 0.0*/
    -3.0, -3.0, 0.0,
    -5.0, 0.0, 0.0,
    -2.0, -2.0, 0.0,
    -2.0, 2.0, 0.0,
    -3.0, 3.0, 0.0,
    -2.0, 2.0, 0.0,
    4.0, 4.0, 0.0,
    -1.0, 8.0, 0.0,
    2.0, 10.0, 0.0,
    4.0, 4.0, 0.0,
    -2.0, 2.0, 0.0,
    3.0, 2.0, 0.0,
    -2.0, 2.0, 0.0,
    -3.0, -2.0, 0.0,
    7.0, 0.0, 0.0,
    3.0, 2.0, 0.0,
    3.0, -2.0, 0.0,
    -2.0, -2.0, 0.0,
    4.0, -4.0, 0.0,
    -1.0, -8.0, 0.0,
    2.0, -10.0, 0.0,
    4.0, -4.0, 0.0



    // -10.0, 0.0, 0.0,
    // -5.0, 50.0, 0.0,
    // 0.0, 0.0, 0.0,
    // 0.0, 0.0, 0.0,
    // 5.0, 50.0, 0.0,
    // 10.0, 0.0,0.0





] );

WebGLRenderEngine.prototype.__vertWidth = 3;
WebGLRenderEngine.prototype.__vertCount = 21;

function NoWebGLException() {} // WebGL Not Supported Error
function ShaderLoadFailed() {} // Could not Link Shaders Error