// ==SiteScript==
// @siteName    FC2 動画
// @siteUrl     http://video.fc2.com/
// @author      DarkKnight
// @authorUrl   http://darkknightlabs.com/
// @scriptUrl   http://darkknightlabs.com/site-script/
// @description revised by mayan, 2014/09/20
// @date        2010/08/29
// @version     0.7.0.23
// ==/SiteScript==


function CravingSiteScript() {
    this._initialize();
}


CravingSiteScript.prototype = {
    _xhr: null,

    _initialize: function() {},

    _getXmlHttpRequest: function() {
        if ( this._xhr != null ) {
            return this._xhr;
        }

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
        this._xhr = xhr;

        return this._xhr;
    },

    _load: function( url, data, method ) {
        var req = this._getXmlHttpRequest();

        var mtd = ( method == null ) ? "GET" : "POST";

        req.open( mtd, url, false );

        if ( mtd == "POST" ) {
            req.setRequestHeader( "Content-Type", "application/x-www-form-urlencoded" );
        }

        req.send( data );

        return req.responseText;
    },

    getResponseText: function( url, data, method ) {
        return this._load( url, data, method );
    },

    getResponseJSON: function( url, data, method ) {
        var text = this._load( url, data, method );

        return eval( "("+text+")" );
    },

    /// Math
    random: function( limit ) {
        return Math.floor( Math.random() * limit );
    },

    /// String
    decodeHtml: function( str ) {
        return str.replace( /&(quot|#0*34);/ig,    "\"" )
                  .replace( /&(amp|#0*38);/ig,     "&"  )
                  .replace( /&(apos|#0*39);/ig,    "'"  )
                  .replace( /&(lt|#0*60);/ig,      "<"  )
                  .replace( /&(gt|#0*62);/ig,      ">"  )
                  .replace( /&(nbsp|#0*160);/ig,   " "  )
                  .replace( /&(frasl|#8260);/ig, "/"  );
    }
}


var _FC2 = {};
_FC2.strUserAgent = "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.0; Trident/5.0)";
_FC2.showDlg = true;
_FC2.payment = false;//有料会員向けとして使う場合は true にします。


function isSiteUrl( url ) {
    if ( url.match( /http:\/\/video\.fc2\.com\/(?:\w{2}\/)?(?:a\/)?content(?:\/[^\/?&#]*)*\/\d{8}[0-9A-Za-z]{8}/ ) ) return true;
    if ( url.match( /http:\/\/video\.fc2\.com\/(?:\w{2}\/)?(?:a\/)?content\.php(\?.+)/ )
         && RegExp.$1.match( /[?&]kobj_up_id=\d{8}[0-9A-Za-z]{8}/ ) ) return true;

    if ( url.match( /http:\/\/(?:yantavideo\.com|whhoumovie\.com|qingyangmovie\.asia|chenghuavideo\.asia)\/(?:\w{2}\/)?(?:a\/)?content(?:\/[^\/?&#]*)*\/\d{8}[0-9A-Za-z]{8}/ ) ) return true;
    if ( url.match( /http:\/\/(?:yantavideo\.com|whhoumovie\.com|qingyangmovie\.asia|chenghuavideo\.asia)\/(?:\w{2}\/)?(?:a\/)?content\.php(\?.+)/ )
         && RegExp.$1.match( /[?&]kobj_up_id=\d{8}[0-9A-Za-z]{8}/ ) ) return true;

    if ( url.match( /http:\/\/(?:video\.fc2\.com|yantavideo\.com|whhoumovie\.com|qingyangmovie\.asia|chenghuavideo\.asia)\/flv[23]\.swf(\?.+)/ )
         && RegExp.$1.match( /[?&]i=\d{8}[0-9A-Za-z]{8}/ ) ) return true;

    return false;
}


function getVideoDetail( url ) {
    var upid;
    var objC = {};//ref

    url = url.replace( /^http:\/\/(?:yantavideo\.com|whhoumovie\.com|qingyangmovie\.asia)\//, "http://chenghuavideo.asia/" );

    if ( url.match( /http:\/\/(?:video\.fc2\.com|chenghuavideo\.asia)\/(?:\w{2}\/)?(?:a\/)?content(?:\/[^\/?&#]*)*\/(\d{8}[0-9A-Za-z]{8})/ ) ){
        var splitUrl = ( url.match( /[?&#]/ ) )? RegExp.leftContext : url;
        var arrUrl = splitUrl.split( "/" );
        upid = arrUrl.pop();
        if ( upid == "" ) upid = arrUrl.pop();
        var type = "page";
    } else if ( url.match( /http:\/\/(?:video\.fc2\.com|chenghuavideo\.asia)\/(?:\w{2}\/)?(?:a\/)?content\.php(\?.+)/ )
                && RegExp.$1.match( /[?&]kobj_up_id=(\d{8}[0-9A-Za-z]{8})/ ) ) {
        upid = RegExp.$1;
        type = "page";
    } else if ( url.match( /http:\/\/(?:video\.fc2\.com|chenghuavideo\.asia)\/flv[23]\.swf(\?.+)/ ) ) {
        var prm = RegExp.$1;
        if ( prm.match( /[?&]i=(\d{8}[0-9A-Za-z]{8})/ ) ) upid = RegExp.$1;
        if ( prm.match( /[?&]sj=(\d+)/ ) ) objC.sj = RegExp.$1;
        if ( prm.match( /[?&]tk=([^&#]+)/ ) ) obj.tk = RegExp.$1;
        objC.otag = "1";
        type = "swf";
    } else {
        //return null;
        type = "unknown";
    }

    var craving = new CravingSiteScript();
    //phpsessid,略

    if ( type == "page" || type == "unknown" ) {
        url = url.split( "#" )[0];
        try {
            objC.text = craving.getResponseText( url );
        } catch( e ) {
            objC.text = "";
        }

        if ( objC.text ) {
            if ( ( objC.text.match( /<param(\s+[^>]*?name\s*=\s*("|')FlashVars\2[^>]*)>/ )
                   && RegExp.$1.match( /\s+value\s*=\s("|')(.*?)\1/ ) ) ||
                 ( objC.text.match( /<embed\s[^>]*?FlashVars\s*=\s*("|')(.*)\1[^>]*>/ ) ) ) {
                var objDat = parsePrm( RegExp.$2 );
                objC.i    = objDat.i?    objDat.i:    "";
                objC.tk   = objDat.tk?   objDat.tk:   "";
                objC.otag = objDat.otag? objDat.otag: "";
                objC.lang = objDat.lang? objDat.lang: "";
                objC.sj   = objDat.sj?   objDat.sj:   "";
                objC.from = objDat.from? objDat.from: "";
            }

            if ( !upid && objC.i ) upid = objC.i;
            pickKey( objC );
            if ( !objC.sj && upid ) pickSj( objC, upid );

            if ( objC.text.match( /<meta(\s+[^>]*property\s*=\s*("|')og:title\2[^>]*)>/ ) &&
                 RegExp.$1.match( /\s+content\s*=\s*("|')(.*?)\1/ ) )
                var title = RegExp.$2;
            if ( !title && objC.text.match( /<h2\s+[^>]*?id\s*=\s*("|')video_title\1[^>]*>\s*(<img\s+[^>]*>\s*)?(.*?)\s*<\/h2>/ ) )
                title = craving.decodeHtml( RegExp.$3 );
        }
    }

    if ( !upid ) return null;

    objC.movie = url;
    objC.fotag = objC.otag;
    objC.fver = getFlashVer();
    objC.upid = upid;
    objC.mimi = makeMimi( upid );
    var strUA = getUA();
    if ( !strUA ) strUA = _FC2.strUserAgent;
    objC.strUA = strUA;
    var objHttp = craving._getXmlHttpRequest();

    var FLAG = false;
    if ( _FC2.payment == true ) {
        var objRet = {};
        FLAG = getData( objHttp, true, objC, objRet );
    }

    if ( FLAG == false ) {
        var objRet = {};
        FLAG = getData( objHttp, false, objC, objRet );
    }

    if ( FLAG == false ) {
        if ( _FC2.showDlg == true ) {
            var objMsg = new clsMsgBox();
            if ( objMsg.isOK )
                objMsg.MsgBox( objRet.text, 0, "from Site-Script" );
        }
        return null;
    }

    var realUrl = objRet.realUrl;
    if ( !title ) title = decodeURIComponent( objRet.title );
    if ( !title ) title = "fc2_" + upid;
    title = title.replace( /[\\\/:*?"<>|]/g, "_" );
    var strHeader = "User-Agent: " + strUA;

    return { videoTitle0: title, videoUrl0: realUrl, httpHeader0: strHeader };
}


function getFlashVer(){
    try {
        var obj = new ActiveXObject( "ShockwaveFlash.ShockwaveFlash" );
        var ver = obj.GetVariable( "$version" );
    } catch( e ) {
        return "";
    }
    if ( !ver ) return "";
    return ver;
}


function getUA(){
    var strUA = "";
    try {
        var obj = new ActiveXObject( "htmlfile" );
        strUA = obj.parentWindow.navigator.userAgent;
    } catch( e ) {
        return "";
    }
    return strUA;
}


function pickKey( objC ) {
    var gk = "";
    objC.gk = gk;
    if ( !objC.text.match( /function\s+cass\([^)]*\)\s*\{([^}]*)}/ ) ) return gk;
    var cass = RegExp.$1;
    var objRegA = new RegExp( "\\s*//.*$", "g" );
    var objRegB = new RegExp( "/\\*[\\s\\S]*?\\*/", "gm" );
    cass = cass.replace( objRegA, "" ).replace( objRegB, "" );
    var objReg = /c\d+\s*=\s*new\s*Array\(\s*(\d+)\s*,\s*('|")(\w)\2\s*\)\s*;/g;
    var arr = [];
    while ( objReg.test( objC.text ) ) {
        var index = parseInt( RegExp.$1, 10 );
        if ( index < 0 || 10 <= index ) continue;
        arr[ index ] = RegExp.$3;
    }
    if ( arr.length == 10 ) gk = arr.join( "" );

    objC.gk = gk;
    return gk;
}


function pickSj( objC, upid ) {
    var strReg1 = "http://video(\\d+)[^/]*\\.fc2\\.com/up/(qr|thumb)/"
                + upid.substr( 0, 6 ) + "/"
                + upid.substr( 6, 2 ) + "/"
                + upid.substr( 8, 1 ) + "/"
                + "(FCUT_)?" + upid + "\\.(png|jpg|gif)";
    var objReg1 = new RegExp( strReg1 );
    var strReg2 = "\"http://video(\\d+)[^/]*\\.fc2\\.com/[^\"]*?"
                + upid
                + "\\.(png|jpg|gif)\"";
    var objReg2 = new RegExp( strReg2 );
    if ( objReg1.test( objC.text ) || objReg2.test( objC.text ) ) var sj = RegExp.$1;
    else sj = "";

    objC.sj = sj;
    return sj;
}


function parsePrm( strPrm ) {
    if ( !strPrm || typeof( strPrm ) != "string" ) return {};
    var arrAmp = strPrm.split( "&" );
    var objDat = {};
    for ( var i = 0; i < arrAmp.length; i++ ){
        arrAmp[ i ] = arrAmp[ i ].replace( /^\s+/, "" ).replace( /\s+$/, "" );
        if ( !arrAmp[ i ] ) continue;
        var arrEq = arrAmp[ i ].split( "=" );
        var name = arrEq[0].replace( /^\s+/, "" ).replace( /\s+$/, "" );
        if ( !name ) continue;
        arrEq.shift();
        if ( arrEq.length > 0 ) var value = arrEq.join( "=" );
        else value = "";
        objDat[ name ] = value;
    }

    return objDat;
}


function getData( objHttp, payment, objC, objRet ) {
    //arg:objHttp:object
    //arg:payment:boolean
    //arg:objC:object
    //arg:objRet
    //ret:boolean

    objRet.text = "";

    if ( payment == true ) var baseurl = "http://video.fc2.com/ginfo_payment.php";
    else baseurl = "http://video.fc2.com/ginfo.php";

    var infourl = baseurl
        + "?mimi=" + objC.mimi
        + ( ( objC.i )? ( "&v=" + objC.i ): "" )
        + ( ( objC.tk )? ( "&tk=" + objC.tk ): "&tk=null" )
        + ( ( objC.fotag )? ( "&otag=" + objC.fotag ): "&otag=0" )
        //+ "&playid=null"
        //+ "&playlistid=null"
        + "&upid=" + objC.upid
        + ( ( objC.movie && ( !objC.fotag || objC.fotag == "0" ) )? ( "&href=" + encodeURIComponent( objC.movie ).replace( /\./g, "%2E" ) ): "&href=" )
        + ( ( objC.lang )? ( "&lang=" + objC.lang ): "&lang=ja" )
        + ( ( objC.fver )? ( "&fversion=" + encodeURIComponent( objC.fver ) ): "" )
        + ( objC.gk? ( "&gk=" + objC.gk ): ( "&gk=gk" ) )
        + ( objC.from? ( "&from=" + objC.from ): "&from=null" );

    try {
        objHttp.open( "GET", infourl, false );
        objHttp.setRequestHeader( "User-Agent", objC.strUA );
        objHttp.send();
        var text = objHttp.responseText;
    } catch( e ) {
        var text = "";
        objRet.text = e.description;
    }
    if ( !text ) return false;

    var objDat = parsePrm( text );
    objRet.text = text;
    objRet.err_code = ( objDat.err_code? objDat.err_code: "" );
    objRet.count = ( objDat.count? objDat.count: "" );
    objRet.title = ( objDat.title? objDat.title: "" );
    objRet.chk = false;

    if ( objDat.mid ) {
        var query = "?mid=" + objDat.mid
                  + ( objDat.cdnt? ( "&px-time=" + objDat.cdnt ): "" )
                  + ( objDat.cdnh? ( "&px-hash=" + objDat.cdnh ): "" );
    } else {
        query = "";
    }

    if ( objDat.filepath ) {
        if ( objDat.KDDI == "1" ) {//2014/09/20, kddi option dead?
            objRet.kddi = true;
            var realUrl = objDat.filepath
                        + "?SIGV=" + ( objDat.SIGV? objDat.SIGV: "" )
                        + "&IS="   + ( objDat.IS? objDat.IS: "" )
                        + "&ET="   + ( objDat.ET? objDat.ET: "" )
                        + "&CIP="  + ( objDat.CIP? objDat.CIP: "" )
                        + "&KO="   + ( objDat.KO? objDat.KO: "" )
                        + "&KN="   + ( objDat.KN? objDat.KN: "" )
                        + "&US="   + ( objDat.US? objDat.US: "" );
            objRet.chk = chkLink( objHttp, realUrl, objC.strUA );
            if ( !objRet.chk && objDat.seek_filepath && query ) {
                realUrl = objDat.seek_filepath + query;
            }
        } else if ( query ) {
            realUrl = objDat.filepath + query;
            objRet.kddi = false;
        }
    } else if ( query && objC.sj && payment == false ) {
        if ( parseInt( objC.sj, 10 ) >= 10000 ) var tip = "http://vip.video";
        else tip = "http://video";
        realUrl = tip + objC.sj + ".fc2.com/up/flv/"
                + upid.substr( 0, 6 ) + "/"
                + upid.substr( 6, 2 ) + "/"
                + upid.substr( 8, 1 ) + "/"
                + upid + ".flv" + query;
    }

    objRet.realUrl = ( realUrl? realUrl: "" );
    if ( !realUrl ) return false;
    else return true;
}


function chkLink( objHttp, realUrl, strUA ) {
    var flag = false;
    try {
        //var objHttp = new ActiveXObject( "WinHttp.WinHttpRequest.5.1" );
        objHttp.Open( "HEAD", realUrl, false );
        objHttp.SetRequestHeader( "User-Agent", strUA );
        objHttp.Send();
        var status = objHttp.Status;
        flag = true;
    } catch( e ) {
        flag = false;
    }
    if ( flag == false ) return false;
    if ( isNaN( status ) ) return false;
    if ( status >= 400 ) return false;
    return true;
}


function clsMsgBox(){
    //WScript.Shell Popup
    this.isOK = false;
    this._objShell = null;

    this._initialize = function (){
        try{
            this._objShell = new ActiveXObject( "WScript.Shell" );
            this.isOK = true;
        } catch( e ) {
            this.isOK = false;
        }
    }
    this._initialize();

    this.MsgBox = function ( msg, sec2wait, title ){
        //ret: OK:1, キャンセル:2
        if ( this.isOK )
            return this._objShell.Popup( msg, sec2wait, title, 1+64 );
    }
}


function makeMimi( upid ){
    var strSeed = "gGddgPfeaf_gzyr";//2011.06.27
    var obj = new clsMD5();
    return obj.getHash( upid + "_" + strSeed );
}


/*************************************************************
 * Dark Knight さんのサイトスクリプト
 * Jokeroo.site.js (var 0.4) より
 * MD5 クラス
 * new で object を作成した後、getHash(str) します。
 *************************************************************/
function clsMD5(){
    var _MD5_T;
    var _MD5_round1;
    var _MD5_round2;
    var _MD5_round3;
    var _MD5_round4;
    var _MD5_round;

    this._initialize = function() {

        _MD5_T = new Array( 0x00000000, 0xd76aa478, 0xe8c7b756, 0x242070db,
                            0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613,
                            0xfd469501, 0x698098d8, 0x8b44f7af, 0xffff5bb1,
                            0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e,
                            0x49b40821, 0xf61e2562, 0xc040b340, 0x265e5a51,
                            0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681,
                            0xe7d3fbc8, 0x21e1cde6, 0xc33707d6, 0xf4d50d87,
                            0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9,
                            0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122,
                            0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60,
                            0xbebfbc70, 0x289b7ec6, 0xeaa127fa, 0xd4ef3085,
                            0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8,
                            0xc4ac5665, 0xf4292244, 0x432aff97, 0xab9423a7,
                            0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d,
                            0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314,
                            0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb,
                            0xeb86d391
                          );

        _MD5_round1 = new Array( new Array(  0,  7,  1 ), new Array(  1, 12,  2 ),
                                 new Array(  2, 17,  3 ), new Array(  3, 22,  4 ),
                                 new Array(  4,  7,  5 ), new Array(  5, 12,  6 ),
                                 new Array(  6, 17,  7 ), new Array(  7, 22,  8 ),
                                 new Array(  8,  7,  9 ), new Array(  9, 12, 10 ),
                                 new Array( 10, 17, 11 ), new Array( 11, 22, 12 ),
                                 new Array( 12,  7, 13 ), new Array( 13, 12, 14 ),
                                 new Array( 14, 17, 15 ), new Array( 15, 22, 16 )
                               );

        _MD5_round2 = new Array( new Array(  1,  5, 17 ), new Array(  6,  9, 18 ),
                                 new Array( 11, 14, 19 ), new Array(  0, 20, 20 ),
                                 new Array(  5,  5, 21 ), new Array( 10,  9, 22 ),
                                 new Array( 15, 14, 23 ), new Array(  4, 20, 24 ),
                                 new Array(  9,  5, 25 ), new Array( 14,  9, 26 ),
                                 new Array(  3, 14, 27 ), new Array(  8, 20, 28 ),
                                 new Array( 13,  5, 29 ), new Array(  2,  9, 30 ),
                                 new Array(  7, 14, 31 ), new Array( 12, 20, 32 )
                               );

        _MD5_round3 = new Array( new Array(  5,  4, 33 ), new Array(  8, 11, 34 ),
                                 new Array( 11, 16, 35 ), new Array( 14, 23, 36 ),
                                 new Array(  1,  4, 37 ), new Array(  4, 11, 38 ),
                                 new Array(  7, 16, 39 ), new Array( 10, 23, 40 ),
                                 new Array( 13,  4, 41 ), new Array(  0, 11, 42 ),
                                 new Array(  3, 16, 43 ), new Array(  6, 23, 44 ),
                                 new Array(  9,  4, 45 ), new Array( 12, 11, 46 ),
                                 new Array( 15, 16, 47 ), new Array(  2, 23, 48 )
                               );

        _MD5_round4 = new Array( new Array(  0,  6, 49 ), new Array(  7, 10, 50 ),
                                 new Array( 14, 15, 51 ), new Array(  5, 21, 52 ),
                                 new Array( 12,  6, 53 ), new Array(  3, 10, 54 ),
                                 new Array( 10, 15, 55 ), new Array(  1, 21, 56 ),
                                 new Array(  8,  6, 57 ), new Array( 15, 10, 58 ),
                                 new Array(  6, 15, 59 ), new Array( 13, 21, 60 ),
                                 new Array(  4,  6, 61 ), new Array( 11, 10, 62 ),
                                 new Array(  2, 15, 63 ), new Array(  9, 21, 64 )
                               );

        _MD5_round = new Array( new Array( this._MD5_F, _MD5_round1 ),
                                new Array( this._MD5_G, _MD5_round2 ),
                                new Array( this._MD5_H, _MD5_round3 ),
                                new Array( this._MD5_I, _MD5_round4 )
                               );

    }

    this._MD5_F = function( x, y, z ) { return (x & y) | (~x & z); }

    this._MD5_G = function( x, y, z ) { return (x & z) | (y & ~z); }

    this._MD5_H = function( x, y, z ) { return x ^ y ^ z;          }

    this._MD5_I = function( x, y, z ) { return y ^ (x | ~z);       }

    this._MD5_pack = function ( n32 ) {
        return String.fromCharCode(   n32          & 0xff ) +
               String.fromCharCode( ( n32 >>> 8  ) & 0xff ) +
               String.fromCharCode( ( n32 >>> 16 ) & 0xff ) +
               String.fromCharCode( ( n32 >>> 24 ) & 0xff );
    }

    this._MD5_unpack = function( s4 ) {
        return  s4.charCodeAt( 0 )         |
              ( s4.charCodeAt( 1 ) <<  8 ) |
              ( s4.charCodeAt( 2 ) << 16 ) |
              ( s4.charCodeAt( 3 ) << 24 );
    }

    this._MD5_number = function( n ) {
        while ( n < 0 ) {
            n += 4294967296;
        }

        while ( n > 4294967295 ) {
            n -= 4294967296;
        }

        return n;
    }

    this._MD5_apply_round = function( x, s, f, abcd, r ) {
        var a, b, c, d;
        var kk, ss, ii;
        var t, u;

        a = abcd[ 0 ];
        b = abcd[ 1 ];
        c = abcd[ 2 ];
        d = abcd[ 3 ];
        kk = r[ 0 ];
        ss = r[ 1 ];
        ii = r[ 2 ];

        u = f( s[ b ], s[ c ], s[ d ] );
        t = s[ a ] + u + x[ kk ] + _MD5_T[ ii ];
        t = this._MD5_number( t );
        t = ( ( t << ss ) | ( t >>> ( 32 - ss ) ) );
        t += s[ b ];
        s[ a ] = this._MD5_number( t );
    }

    this._MD5_hash = function( data ) {
        var abcd, x, state, s;
        var len, index, padLen, f, r;
        var i, j, k;
        var tmp;

        state = new Array( 0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476 );
        len = data.length;
        index = len & 0x3f;
        padLen = ( index < 56 ) ? ( 56 - index ) : ( 120 - index );

        if ( padLen > 0 ) {
            data += "\x80";
            for ( i = 0; i < padLen - 1; i++) {
                data += "\x00";
            }
        }

        data += this._MD5_pack( len * 8 );
        data += this._MD5_pack( 0 );
        len  += padLen + 8;
        abcd = new Array( 0, 1, 2, 3 );
        x    = new Array( 16 );
        s    = new Array( 4 );

        for ( k = 0; k < len; k += 64 ) {
            for( i = 0, j = k; i < 16; i++, j += 4 ) {
                x[ i ] = data.charCodeAt( j     )         |
                       ( data.charCodeAt( j + 1 ) <<  8 ) |
                       ( data.charCodeAt( j + 2 ) << 16 ) |
                       ( data.charCodeAt( j + 3 ) << 24 );
            }

            for ( i = 0; i < 4; i++ ) {
                s[ i ] = state[ i ];
            }

            for ( i = 0; i < 4; i++ ) {
                f = _MD5_round[ i ][ 0 ];
                r = _MD5_round[ i ][ 1 ];

                for ( j = 0; j < 16; j++ ) {
                    this._MD5_apply_round( x, s, f, abcd, r[ j ] );
                    tmp = abcd[ 0 ];
                    abcd[ 0 ] = abcd[ 3 ];
                    abcd[ 3 ] = abcd[ 2 ];
                    abcd[ 2 ] = abcd[ 1 ];
                    abcd[ 1 ] = tmp;
                }
            }

            for ( i = 0; i < 4; i++ ) {
                state[ i ] += s[ i ];
                state[ i ] = this._MD5_number( state[ i ] );
            }
        }

        return this._MD5_pack( state[ 0 ] ) +
               this._MD5_pack( state[ 1 ] ) +
               this._MD5_pack( state[ 2 ] ) +
               this._MD5_pack( state[ 3 ] );
    }

    this.getHash = function ( data ) {
        var result = "";
        var bit128 = this._MD5_hash(data);

        for ( var i = 0; i < 16; i++ ) {
            var c = bit128.charCodeAt( i );
            result += "0123456789abcdef".charAt( ( c >> 4 ) & 0xf );
            result += "0123456789abcdef".charAt( c & 0xf );
        }

        return result;
    }

    this._initialize();
}