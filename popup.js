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

// Not needed because showPosition is triggered on load
// document.getElementById("geoStationButton").addEventListener("click", showPosition);