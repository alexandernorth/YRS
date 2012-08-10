var searchBtnHandler = function () {
    console.log( "Building Graph" );
    var inputID = $( "#searchbox" ).val();
    //model.buildGraphFor(        inputID );

    model.updateGraph( "1", "2", -1 );
    model.updateGraph( "1", "3", -1 );
    model.updateGraph( "1", "4", +1 );
    model.updateGraph( "4", "2", -1 );
    model.updateGraph( "5", "6", -1 );
    model.updateGraph( "5", "3", -1 );
    model.updateGraph( "5", "4", -1 );
    model.updateGraph( "6", "7", -1 );
    model.updateGraph( "6", "8", -1 );
    model.updateGraph( "6", "9", -1 );
    model.updateGraph( "6", "10", -1 );
    model.updateGraph( "7", "8", -1 );
    model.updateGraph( "8", "9", -1 );
    model.updateGraph( "10", "9", -1 );
    model.updateGraph( "11", "8", -1 );
    model.updateGraph( "11", "7", -1 );
    model.updateGraph( "11", "13", -1 );
    model.updateGraph( "12", "11", -1 );
    model.updateGraph( "12", "14", -1 );
    model.updateGraph( "13", "12", -1 );
    model.updateGraph( "13", "15", -1 );
    model.updateGraph( "12", "15", -1 );
    model.updateGraph( "14", "1", -1 );
    model.updateGraph( "4", "13", -1 );
    model.updateGraph( "5", "11", -1 );

    model.names = { Joe: 1, Bloggs: 2, Jane: 3, Doe: 4, John: 5, Brown: 6, Ashok: 7, Menon: 8, Alex: 9, North: 10, Leon: 11, Byford: 12, Seb: 13, Nathan: 14, Atkinstall: 15 };

    model.tags  = { yrs2012: 5, yrshelp: 2, sapyrs: 1 };

    model.userTags = {

        Joe: { yrs2012: 1, yrshelp: 1 },
        Bloggs: { yrs2012: 1, sapyrs: 1 },
        Jane: { yrs2012: 1, yrshelp: 1 },
        Doe: { yrs2012: 1 },
        John: { yrs2012: 1 },
        Brown: {},
        Ashok: {},
        Menon: {},
        Alex: {},
        North: {},
        Leon: {},
        Byford: {},
        Seb: {},
        Nathan: {},
        Atkinstall: {}

    };

    model.startSimulation();

};