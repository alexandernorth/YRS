var geocoder;

function addAddressToMap(response) 
{
	map.clearOverlays();
	if (!response || response.Status.code != 200) 
	{
		alert("Sorry, we were unable to geocode that address");
	} 
	else 
	{
		place = response.Placemark[0];
		point = new GLatLng(place.Point.coordinates[1],
							place.Point.coordinates[0]);
		marker = new GMarker(point);
		map.setCenter(point, 13);
		map.addOverlay(marker);
		document.getElementById('address').innerHTML = place.address;
	}
}

function initialize() 
{
	map = new GMap2(document.getElementById("map_canvas"));
	map.setCenter(new GLatLng(34, 0), 1);
	map.setUIToDefault();
	geocoder = new GClientGeocoder();
	if (navigator.geolocation) 
	{
		navigator.geolocation.getCurrentPosition(function(position) 
		{  
			document.getElementById('latitude').innerHTML = position.coords.latitude;
			document.getElementById('longitude').innerHTML = position.coords.longitude;
			var coord = position.coords.latitude+","+position.coords.longitude;
			geocoder.getLocations(coord, addAddressToMap);
		}); 
	} 
}