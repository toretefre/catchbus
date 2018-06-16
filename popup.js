var resultText = document.getElementById("resultText");
var jsondata;

$( document ).ready(function() {
    console.log( "Document loaded, starting calls!" );
    navigator.geolocation.getCurrentPosition(function(position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        getNearestStop(latitude, longitude);
        console.log( "getNearestStop has been called!" );
    });
});


function showLocation() {
    console.log("showLocation called!");
    // Constructing test data
    var mode = 1;
    var routeNumber = 5;
    var destination = "Dragvoll";
    var now = new Date();
    // test purposes
    var minutesToNextDeparture = 1;
    var departureTime = new Date(now.getTime() + minutesToNextDeparture * 60000);
    var departure = [mode, routeNumber, destination, departureTime];
    
    resultText.innerHTML =  "<span>" + findMode(departure[0]) + " " + departure[1] + " mot " + departure[2] + " " +
                            timeUntilDeparture(departure[3], now) + "</span>";

    console.log("showLocation finished!");
    console.log("JSON-data: " + jsondata);
}


function getNearestStop(latitude, longitude) {
    var xhr = new XMLHttpRequest();
    console.log(latitude + " " + longitude);
    xhr.open("GET", "https://api.entur.org/api/geocoder/1.1/reverse?point.lat=" +
            latitude + "&point.lon=" + longitude +
            "&lang=en&size=10&layers=venue&category=onstreetBus");
    xhr.setRequestHeader("Content-Type", "text/json");
    xhr.send();
    console.log("XMLHttpRequest sent!");
    xhr.onreadystatechange = function () {
        if(xhr.readyState === 4 && xhr.status === 200) {
            console.log("Operation done, 200 received!");
            jsondata = xhr.response;
            showLocation();
        }
    }
}


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