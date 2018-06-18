var resultText = document.getElementById("resultText");
var closestStops = [];

// Executed when document is loaded
$( document ).ready(function() {
    console.log( "Document loaded, polling for position..." );
    navigator.geolocation.getCurrentPosition(function(position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        console.log("Position found, calling getNearestStops with coords " + latitude + ", " + longitude);
        getNearestStops(latitude, longitude);
    });
});

// Changes the HTML when data is ready
function showLocation(closestStops, latitude, longitude) {
    console.log("showLocation called!");
    var stopsTable = "<table><th>Haldeplass</th><th>Transportmiddel</th><th>StoppID</th><th>Avstand</th>";
    for (var i = 0; i < closestStops.length; i++) {
        stopsTable +=
            "<tr><td>"  + getStationName(closestStops[i][1]) +
            "</td><td>" + getMode(closestStops[i][0]) +
            "</td><td>" + getStopID(closestStops[i][2]) +
            "</td><td>" + getDistance(closestStops[i][3]) + "</td></tr>";
    }
    console.log(stopsTable);
    resultText.innerHTML = stopsTable;
    console.log("showLocation finished!");
}

function getStationName(station) {
    return station;
}

function getStopID(IdString) {
    return (IdString.slice(14));
}

function getDistance(distance) {
    return (distance*1000 + " meter");
}


// Defines how many nearby stops to locate:
var numberOfStops = 4;
// Defines what kind of stations to locate, onstreetBus is only bus
var mode = "onstreetBus";


// Connects with Entur-API to find nearby stations based on coordinates
function getNearestStops(latitude, longitude) {
    var xhr = new XMLHttpRequest();
    console.log("getNearestStops called with coords " + latitude + ", " + longitude);
    xhr.open("GET", "https://api.entur.org/api/geocoder/1.1/reverse?point.lat=" +
            latitude + "&point.lon=" + longitude +
            "&lang=en&size=" + numberOfStops + "&layers=venue&category=" + mode);
    xhr.setRequestHeader("ET-Client-Name", "https://github.com/toretefre/catchbus");
    xhr.send();
    console.log("XMLHttpRequest to find the " + numberOfStops + " closest stops sent!");
    xhr.onreadystatechange = function () {
        if(xhr.readyState === 4 && xhr.status === 200) {
            console.log("XMLHttpRequest returned the following JSON with status code 200:");
            parseJSONData(xhr.response);
            showLocation(closestStops, latitude, longitude);
        }
    }
}


// Parses JSON station data received from Entur into Javascript objects
function parseJSONData(jsonToParse) {
    console.log(jsonToParse);
    var parsedJSON = JSON.parse(jsonToParse);
    console.log("JSON parsed! List of IDs:");
    for (var i = 0; i < numberOfStops; i++) {
        var category = parsedJSON["features"][i]["properties"]["category"];
        var stopName = parsedJSON["features"][i]["properties"]["name"];
        var stopID = parsedJSON["features"][i]["properties"]["id"];
        var distance = parsedJSON["features"][i]["properties"]["distance"];
        var latitude = parsedJSON["features"][i]["geometry"]["coordinates"][1];
        var longitude = parsedJSON["features"][i]["geometry"]["coordinates"][0];
        closestStops.push([category, stopName, stopID, distance, latitude, longitude]);
    }
    console.log("Array containg closest stops: " + closestStops);
}


// Translates minutes until departure to readable text
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

// Translates digit representation into form of transportation
function getMode(mode) {
    mode += "";
    switch (mode) {
        case "onstreetBus":
            return "Buss";
        default:
            return "Usikker";
    }
}