/*
Sample JQuery code
$( document ).ready(function() {
        $( "a" ).click(function( event ) {
            alert( "JQuery er installert og vil snart gje deg sanntidsdata!" );
            event.preventDefault();
        });
    });
*/

    $( function() {
        var availableStations = [
            "Gløshaugen Syd",
            "Dragvoll",
            "Munkegata",
            "Samfundet",
            "Studentersamfundet",
            "Prinsenkrysset"
        ];

        $("#stations").autocomplete({
            source: availableStations
        });
    });