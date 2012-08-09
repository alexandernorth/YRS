var resizeCanvas = function() {
    var c       = $( "#canvas" );
    var cDOM    = c.get(     0 );

    var cWidth  = c.parent().innerWidth()  - 30;
    var cHeight = c.parent().innerHeight() - 30;

    c.css( {

        width:  cWidth  + 'px', 
        height: cHeight + 'px'

    } );

    cDOM.width  =  cWidth;
    cDOM.height = cHeight;

};

$(document).ready( resizeCanvas );
$(window).resize(  resizeCanvas );