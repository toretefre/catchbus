var resultText = document.getElementById("resultText");
var stations = document.getElementById("stations");

$( document ).ready(function() {
    console.log( "JQuery has started!" );
    navigator.geolocation.getCurrentPosition(function(position) {
        // Constructing test data
        var mode = 1;
        var routeNumber = 5;
        var destination = "Dragvoll";
        var now = new Date();
        // test purposes
        var minutesToNextDeparture = 0;
        var departureTime = new Date(now.getTime() + minutesToNextDeparture * 60000);
        var user = ["Brukerposisjon", position.coords.latitude, position.coords.longitude];
        var departure = [mode, routeNumber, destination, departureTime];
        showLocation(user, nameOfStop(samfundet), distanceInMetersBetweenUserAndStop(user, samfundet), departure, now);
    });
    console.log( "JQuery has polled for location!" );
});


function showLocation(user, closestStop, distanceToClosestStop, departure, now) {
    stations.placeholder = closestStop;
    console.log(user[1].toFixed(6), user[2].toFixed(6));
    
    resultText.innerHTML =  "<span>" + findMode(departure[0]) + " " + departure[1] + " mot " + departure[2] + " " +
                            timeUntilDeparture(departure[3], now) + "</span>" +
                            "<span><br>Du er " + distanceToClosestStop + " meter-ish unna " + closestStop + ".</span>";
    console.log( "JQuery has displayed location!" )
}

// [name, lat, lon]
var prinsenkino = ["Prinsen Kinosenter", 63.426319, 10.393601];
var samfundet = ["Samfundet", 63.422609, 10.394647];


function timeUntilDeparture(departureTime, now) {
    var minutesUntil = (departureTime.getTime() - now.getTime()) / 60000;

    switch (minutesUntil) {
        case 0:
            return "er rett rundt hjørnet!";
        case 1:
            return "kjem om ett minutt.";
        case 2:
            return "kjem om to minutt.";
        case 3:
            return "kjem om tre minutt.";
        case 4:
            return "kjem om fire minutt.";
        case 5:
            return "kjem om fem minutt.";
        default:
            return "kjem " + departureTime;
    }
}


function findMode(mode) {
    switch (mode) {
        case 0:
            return "Gå";
        case 1:
            return "Buss";
        case 2:
            return "Trikk";
        case 3:
            return "Tog";
    }
}


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