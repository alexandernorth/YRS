var searchBtnHandler = function () {

    var inputID = $( "#searchbox" ).val();
    model.buildGraphFor(        inputID );
    $(  '#progressContainer').slideDown();
    $( '#progressBar').css('width','0px');

};

function updateProgressBar(percent){
	var percent = 					Math.min(percent, 1);
	var width = 		 $('#progressContainer').width();
	$('#progressBar').animate({"width": width*percent });
}