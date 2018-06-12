var resultText = document.getElementById("resultText");

$( document ).ready(function() {
    console.log( "JQuery has started!" );
    navigator.geolocation.getCurrentPosition(function(position) {
        showLocation(position.coords.latitude, position.coords.longitude);
    });
    console.log( "JQuery has polled for location!" )
});


function showLocation(latitude, longitude) {
    resultText.innerHTML = "Latitude: " + latitude +
        "<br>Longitude: " + longitude;
    console.log( "JQuery has displayed location!" )
}

var testUserLat = 63.422557
var testUserLon = 10.397147

var prinsenkinoLat = 63.426319
var prinsenkinoLon = 10.393601

var samfundetLat = 63.422609
var samfundetLon = 10.394647


function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function distanceInMetersBetweenEarthCoordinates(userLat, userLon, stopLat, stopLon) {
  const earthRadiusKm = 6371;

  var dLat = degreesToRadians(stopLat - userLat);
  var dLon = degreesToRadians(stopLon - userLon);

  userLat = degreesToRadians(userLat);
  stopLat = degreesToRadians(stopLat);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(userLat) * Math.cos(stopLat);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (earthRadiusKm * c) * 1000;
}

// Not needed because showPosition is triggered on load
// document.getElementById("geoStationButton").addEventListener("click", showPosition);