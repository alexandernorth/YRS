var searchBtnHandler = function () {

    var inputID = $( "#searchbox" ).val();
    model.buildGraphFor(        inputID );
    $(  '#progressContainer').slideDown();

};

function updateProgressBar(percent){
	var width = 		 $('#progressContainer').width();
	$('#progressBar').animate({"width": width*percent });
}