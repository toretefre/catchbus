const resultText = document.getElementById("resultText");
// Array containing closest public transport stations
let closestStops = [];
// Array containing closest city bike racks
let closestRacks = [];
// Array containing all elements to be display
let closestEverything = [];
// Defines how many nearby stops to locate:
const numberOfStops = 5;
// Defines what kind of stations to locate, onstreetBus is only bus
const mode = "onstreetBus";


// Executed when document is loaded
$(document).ready(function () {
    console.log("Document loaded, asking for Geolocation!");
    getPosition();
    getAllCityBikesTrondheim();
});


// Getting position HTML5 way
function getPosition() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(savePosition);
        console.log("Geolocation available, polling...");
    }
    else {
        setTimeout(function(){
            console.log("Geolocation failed / not supported, redirecting!");
            resultText.innerHTML = "Vi klarar ikkje hente posisjonen din, sender deg til en-tur.no";
        }, 4000);
        window.location.replace("https://en-tur.no");
    }
}


// Storing position, HTML5 way
function savePosition(position) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    localStorage.setItem("latitude", lat);
    localStorage.setItem("longitude", lon);
    console.log("Position stored: ", lat + ", " + lon);
    getNearestStops();
}


// Changes the HTML when data is ready
function showLocation(closestStops) {
    console.log("showLocation called!");
    let stopsTable = "<table><th>Haldeplass</th><th>Transportmiddel</th><th>StoppID</th><th>Avstand</th>";
    for (let i = 0; i < closestStops.length; i++) {
        stopsTable +=
            "<tr><td>" + getStationName(closestStops[i][1]) +
            "</td><td>" + getMode(closestStops[i][0]) +
            "</td><td>" + getStopID(closestStops[i][2]) +
            "</td><td>" + getDistance(closestStops[i][3]) + "</td></tr>";
    }
    resultText.innerHTML = stopsTable;
    console.log("showLocation finished!");
}


// Connects to Entur API to find nearby stations based on coordinates
function getNearestStops() {
    const latitude = localStorage.getItem("latitude");
    const longitude = localStorage.getItem("longitude");
    console.log("getNearestStops called with coords " + latitude + ", " + longitude);
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.entur.org/api/geocoder/1.1/reverse?point.lat=" +
        latitude + "&point.lon=" + longitude +
        "&lang=en&size=" + numberOfStops + "&layers=venue&category=" + mode);
    xhr.setRequestHeader("ET-Client-Name", "https://github.com/toretefre/catchbus");
    xhr.send();
    console.log("XMLHttpRequest to find the " + numberOfStops + " closest stops sent!");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("XMLHttpRequest returned the following JSON with status code 200:");
            parseStationData(xhr.response);
            showLocation(closestStops);
        }
    }
}


// Parses JSON station data received from Entur into Javascript objects
function parseStationData(jsonToParse) {
    let parsedJSON = JSON.parse(jsonToParse);
    console.log("Station JSON parsed! List of closest stations:");
    for (let i = 0; i < numberOfStops; i++) {
        let category = parsedJSON["features"][i]["properties"]["category"];
        let stopName = parsedJSON["features"][i]["properties"]["name"];
        let stopID = parsedJSON["features"][i]["properties"]["id"];
        let distance = parsedJSON["features"][i]["properties"]["distance"];
        let latitude = parsedJSON["features"][i]["geometry"]["coordinates"][1];
        let longitude = parsedJSON["features"][i]["geometry"]["coordinates"][0];
        let nextDepartures = getNextDepartures(stopID);

        closestStops.push([category, stopName, stopID, distance, latitude, longitude]);
    }
    console.log(closestStops);
}


// Connects with Trondheim City Bikes API to fetch all city bike racks
function getAllCityBikesTrondheim() {
    console.log("getAllCityBikesStationsTrondheim called");
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://gbfs.urbansharing.com/trondheim/station_information.json");
    xhr.send();
    console.log("Requested system information Trondheim City Bikes!");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("JSON containing city bike information received:");
            parseCityBikeRacksTrondheim(xhr.response);
        }
    }
}


function getCityBikeStatusTrondheim() {
    console.log("getCityBikeStatusTrondheim called!");
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://gbfs.urbansharing.com/trondheim/station_status.json");
    xhr.send();
    console.log("Requested system status Trondheim City Bikes!");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("JSON containing city bike status received:");
            parseCityBikeStatusTrondheim(xhr.response);
        }
    }
}


function parseCityBikeStatusTrondheim(jsonToParse) {
    let parsedJSON = JSON.parse(jsonToParse);
    console.log("System status JSON parsed! Updating rack list");
    const numberOfRacks = parsedJSON["data"]["stations"].length;
    for (let i = 0; i < numberOfRacks; i++) {
        let rackID = parsedJSON["data"]["stations"][i]["station_id"];
        let bikes = parsedJSON["data"]["stations"][i]["num_bikes_available"];
        let freeDocks = parsedJSON["data"]["stations"][i]["num_docks_available"];
        let open = parsedJSON["data"]["stations"][i]["is_renting"];

        closestRacks.push([rackID, bikes, freeDocks, open]);
    }
}


// Parses received JSON from Trondheim City Bikes
function parseCityBikeRacksTrondheim(jsonToParse) {
    let parsedJSON = JSON.parse(jsonToParse);
    console.log("Rack JSON parsed! List of closest racks:");
    const numberOfRacks = parsedJSON["data"]["stations"].length;
    for (let i = 0; i < numberOfRacks; i++) {
        let rackID = parsedJSON["data"]["stations"][i]["station_id"];
        let rackName = parsedJSON["data"]["stations"][i]["name"];
        let rackAddress = parsedJSON["data"]["stations"][i]["address"];
        let rackCapacity = parsedJSON["data"]["stations"][i]["capacity"];
        let rackLat = parsedJSON["data"]["stations"][i]["lon"];
        let rackLon = parsedJSON["data"]["stations"][i]["lat"];

        // -1 value is to be replaced with number of available bikes in rack
        closestRacks.push([rackID, rackName, rackAddress, rackCapacity, rackLat, rackLon, -1]);
    }
    console.log(closestRacks);
}


// Translates minutes until departure to readable text
function timeUntilDeparture(departureTime, now) {
    let minutesUntil = (departureTime.getTime() - now.getTime()) / 60000;

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

// Used to calculate distance to nearest city bikes
function distanceInMetersBetweenCoordinates(lat1, lon1, lat2, lon2) {
  const earthRadiusKm = 6371;

  let dLat = degreesToRadians(lat2 - lat1);
  let dLon = degreesToRadians(lon2 - lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (earthRadiusKm * c) * 1000;
}


// Translates digit representation into form of transportation
function getMode(mode) {
    mode += "";
    switch (mode) {
        case "onstreetBus":
            return "Buss";
        case "railStation":
            return "Tog";
        default:
            return "Usikker";
    }
}


function getNextDepartures(stopID) {
    fetch('https://api.entur.org/journeyplanner/2.0/index/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `
        {
          stopPlace(id: "NSR:StopPlace:42660") {
            id
            name
            estimatedCalls(startTime:"2018-06-30T20:25:00+0200" timeRange: 7210000, numberOfDepartures: 10, omitNonBoarding:true) {     
              realtime
              aimedDepartureTime
              expectedDepartureTime
              forBoarding
              destinationDisplay {
                frontText
              }
              serviceJourney {
                journeyPattern {
                  line {
                    publicCode
                    operator {
                      id
                    }
                    id
                    name
                    transportMode
                  }
                }
              }
            }
          }
        }
        `}),
    })
    .then(res => res.json())
    .then(res => console.log(res.data));
}


function getStationName(station) {
    return station;
}


function getStopID(IdString) {
    return (IdString.slice(14));
}


function getDistance(distance) {
    return (distance * 1000 + " meter");
}