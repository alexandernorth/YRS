var searchBtnHandler = function () {
    console.log( "Building Graph" );
    var inputID = $( "#searchbox" ).val();
    model.buildGraphFor(        inputID );

};