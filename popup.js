$( document ).ready(function() {
        $( "a" ).click(function( event ) {
            alert( "JQuery er installert og vil snart gje deg sanntidsdata!" );
            event.preventDefault();
        });
    });