(function get(){
    var xhr = null;
    var these = [
          function() { return new XMLHttpRequest(); }
        , function() { return new ActiveXObject( "Msxml2.XMLHTTP" ); }
        , function() { return new ActiveXObject( "Microsoft.XMLHTTP" ); }
        , function() { return new ActiveXObject( "Msxml2.XMLHTTP.4.0" ); }
    ];

    for ( var i = 0, length = these.length; i < length; i++ ) {
        var func = these[ i ];
        try {
            xhr = func();
            break;
        }
        catch( e ) {}
    }
    objHttp = xhr;
    
    var elm = document.getElementById("url");
    objHttp.open( "GET", elm.value, false );
//    objHttp.setRequestHeader( "User-Agent", objC.strUA );
    objHttp.send();
    document.getElementById("source").value = objHttp.responseText;
}
