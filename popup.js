$( document ).ready(function() {
        $( "a" ).click(function( event ) {
            alert( "JQuery er installert og vil snart gje deg sanntidsdata!" );
            event.preventDefault();
        });
    });


var resultText = document.getElementById("resultText");
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        resultText.innerHTML = "Geolocation is not supported by this browser.";
    }
}


function showPosition(position) {
    resultText.innerHTML = "Latitude: " + position.coords.latitude +
        "<br>Longitude: " + position.coords.longitude;
}