(function() {
    var requestAnimationFrame =       window.requestAnimationFrame 
                           ||    window.mozRequestAnimationFrame 
                           || window.webkitRequestAnimationFrame 
                           ||     window.msRequestAnimationFrame
                           || function( callback, element ) {

        window.setTimeout( callback, 1000 / 60 );

   };
  window.requestAnimationFrame = requestAnimationFrame;
})();