var resultText = document.getElementById("resultText");
var stations = document.getElementById("stations");

$( document ).ready(function() {
    console.log( "JQuery has started!" );
    navigator.geolocation.getCurrentPosition(function(position) {
        // Constructing test data
        var departureTime = new Date().getTime();
        var routeNumber = 5;
        var destination = "Dragvoll/Lohove";
        var user = ["Brukerposisjon", position.coords.latitude, position.coords.longitude];
        var departure = [routeNumber, destination, departureTime];
        showLocation(user, nameOfStop(samfundet), distanceInMetersBetweenUserAndStop(user, samfundet), departure);
    });
    console.log( "JQuery has polled for location!" );
});


function showLocation(user, closestStop, distanceToClosestStop, departure) {
    // test data
    var currentTime = new Date();
    var timeUntilDeparture = departure[2] - currentTime;

    stations.placeholder = closestStop;
    resultText.innerHTML =  "<span>Latitude: " + user[1].toFixed(6) + "</span>" +
                            "<span><br>Longitude: " + user[2].toFixed(6) + "</span>" +
                            "<span><br>Neste " + departure[0] + " mot " + departure[1] + " kjem om" +
                            "<br>" + timeUntilDeparture + " minutt</span>" +
                            "<span><br>Du er " + distanceToClosestStop + " meter unna " + closestStop + "</span>";
    console.log( "JQuery has displayed location!" )
}

// [name, lat, lon]
var prinsenkino = ["Prinsen Kinosenter", 63.426319, 10.393601];
var samfundet = ["Samfundet", 63.422609, 10.394647];


function nameOfStop(stop) {
    return stop[0];
}


function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}


function distanceInMetersBetweenUserAndStop(user, stop) {
    const earthRadiusKm = 6371;

    var userLat = user[1];
    var userLon = user[2];

    var stopLat = stop[1];
    var stopLon = stop[2];

    var dLat = degreesToRadians(stopLat - userLat);
    var dLon = degreesToRadians(stopLon - userLon);

    userLat = degreesToRadians(userLat);
    stopLat = degreesToRadians(stopLat);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(userLat) * Math.cos(stopLat);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return ((earthRadiusKm * c) * 1000).toFixed(0);
}

// Not currently needed because showPosition is triggered on load
// document.getElementById("geoStationButton").addEventListener("click", showPosition);