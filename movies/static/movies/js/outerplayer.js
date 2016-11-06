$(".player").css('display', 'block');

var com = window.com ? window.com : {};
com.fc2 = com.fc2 ? com.fc2 : {};
com.fc2.video = com.fc2.video ? com.fc2.video : {};
com.fc2.video.CORSRequest = function (a) {
    var c, w = a.complete, s = a.failed, k = a.path, q;
    k ? (c = function () {
        var a = new XMLHttpRequest;
        "withCredentials" in a ? a.open("" +
            "" +
            "" +
            "GET", k, !0) : "undefined" != typeof XDomainRequest ? (a = new XDomainRequest, a.open("" +
            "" +
            "" +
            "GET", k)) : a = null;
        return a
    }(), c.onload = function () {
        q = c.responseText;
        w && w(q)
    }, c.onerror = function () {
        s && s()
    }, this.get = function () {
        c.send()
    }) : s && s()
};
com.fc2.video.modify_date = "201607190236";
com.fc2.video.cnDomain = "jinniumovie.be";
com.fc2.video.version = "2.0.7";
com.fc2.video.test = !1;

(function () {
    var a = com.fc2.video;
    if (void 0 === a.exec) {
        var c = window,
            w = a.cnDomain,
            s = "http://" + w + "/", k = "f", q = "i",
            I = !1,
            J = -1,
            y = "",
            D,
            F = [],
            h = function () {
                var a = !1;
                navigator.plugins["Shockwave Flash"] && (a = !0);
                try {
                    new ActiveXObject("ShockwaveFlash.ShockwaveFlash"), a = !0
                } catch (f) {
                }
                return a ? k : 0 <= navigator.userAgent.indexOf("Android") && (D = !0, a = navigator.userAgent.match(/Android\s([0-9])/), 2 >= parseInt(a[1])) ? q : "h"
            }(),
            G = function () {
                console.log('G');
                var a = document,
                    f = !1,
                    c = !1,
                    h = [],
                    k = function (a) {
                        "function" === typeof a && h.push(a)
                    }, q = function () {
                        for (; h.length;)h.shift()();
                        k = function (a) {
                            a()
                        }
                    }, g = function () {
                        a.addEventListener ? a.removeEventListener("DOMContentLoaded", g, !1) : a.detachEvent("onreadystatechange", g);
                        e()
                    }, e = function () {
                        if (!c) {
                            if (!a.body)return setTimeout(e, 1);
                            c = !0;
                            q()
                        }
                    }, d = function () {
                        if (!c) {
                            try {
                                a.documentElement.doScroll("left")
                            } catch (t) {
                                setTimeout(d, 1);
                                return
                            }
                            e()
                        }
                    };
                return function (t) {
                    k(t);
                    t = !1;
                    if (!f)if (f = !0, "complete" === a.readyState && e(), a.addEventListener)a.addEventListener("DOMContentLoaded", g, !1), window.addEventListener("load", g, !1); else if (a.attachEvent) {
                        a.attachEvent("onreadystatechange",
                            g);
                        window.attachEvent("onload", g);
                        try {
                            t = null == window.frameElement
                        } catch (c) {
                        }
                        a.documentElement.doScroll && t && d()
                    }
                }
            }();

        a.exec = function () {
            console.log('a.exec');
            var K = /^(http:\/\/.+?\/)([a-z]{2})?\/?(a\/)?content\/([0-9]{8}[0-9a-zA-Z]{8})/,

                f = function (a, e) {
                    console.log('f in a.exec');
                    var d = a.getAttribute(e);
                    return d ? d : ""

                }, z = function (a, e) {
                    console.log('z in a.exec');
                    function d() {

                        var a = new Date, d = a.getDate(), g = a.getFullYear(), a = a.getMonth() + 1, d = 7 * Math.floor(d / 7) + 1;
                        y = g + ("0" + a).slice(-2) + ("0" + d).slice(-2);
                        e()
                    }

                    (new com.fc2.video.CORSRequest({
                        path: a,
                        complete: function (a) {
                            try {
                                var g = JSON.parse(a).timestamp;
                                g ? (y = g, e()) : d()
                            } catch (c) {
                                d()
                            }
                        },
                        failed: d

                    })).get();

                    console.log('asdfasdf' + y);

                }, G = function (g) {
                    console.log('G in a.exec')
                    var e = a.staticUrl + "html/getHtml5Impression.html", d, c;
                    h === k ? (c = "flash", d = "") : "h" === h ? (c = "html5", d = D ? "_html5androidplayer" : "_html5player") : (c = "html5", d = "_html5androidimage");
                    e = e + ("?utm_source=" + g) + ("&utm_medium=" + c);
                    e += "&utm_term=" + c;
                    e += "&utm_content=" + a.modify_date;
                    return e += "&utm_campaign=outertag" + d + "_impression"

                }, L = function (a) {
                    var c = a.match(/%[0-9a-z][0-9a-z]/igm);
                    a = a.match(/%/igm);
                    return c && a && c.length === a.length

                }, A = function () {
                    console.log(y + 'A');

                    function g() {
                        console.log('g in A in ');
                        var a = 0;
                        c.innerWidth ? a = c.innerWidth : document.documentElement && 0 != document.documentElement.clientWidth ? a = document.documentElement.clientWidth : document.body && (a = document.body.clientWidth);
                        a !== J && (e(), J = a)
                    }

                    console.log(y);
                    function e() {
                        for (var a = 0, d = F.length; a < d; a++) {
                            var b = F[a], e = b.dom, g;
                            g = c.getComputedStyle ? +c.getComputedStyle(e).width.replace("px", "") : e.parentNode.offsetWidth;
                            var f = b.width,
                                b = b.height,
                                l = b / f;
                            h === k && 0 !== g ? e.style.height = g * l + "px" : h === q && e.firstChild.setAttribute("style", "width: " + f + ";height: " + b)
                        }
                    }

                    console.log(y);
                    for (var d = document,
                             t = d.getElementsByTagName("script"),
                             s = t.length,
                             B = location.href,
                             B = ("" + (B ? B : "")).replace(/^(.*)\/\/(.*)\/.*/, "$2").replace("&", ""),
                             E = 0
                        ; E < s; E++) {
                        var l = t[E];

                        if (f(l, "url")) {
                            var n = f(l, "url").match(K),
                                p = a.frontUrl,
                                u = n && n[2] ? n[2] : "",
                                A = "cn" != u ? u + "/" : "",
                                D = n && n[3] ? n[3] : "",
                                v = n && n[4] ? n[4] : "";
                            "http://video.fc2.com/" != p && (u = "cn");

                            if (16 == v.length) {
                                var r = f(l, "sj");
                                "cn" == u && 0 <= r.indexOf("vip.cvideoimgs") && (r = r.replace("fc2.com", w));
                                var C = f(l, "tl"),
                                    z = f(l, "tk"),
                                    m = f(l, "d"),
                                    x = "off" == f(l, "suggest").toLowerCase() ? "0" : "1",
                                    M = "on" == f(l, "loop").toLowerCase() ? "1" : "0",
                                    n = f(l, "w") ? f(l, "w") : 320, H = f(l, "h") ? f(l, "h") : 180,
                                    b = "i=" + v,
                                    b = b + ("&d=" + m),
                                    b = b + "otag=1",
                                    b = b + ("&sj=" + r),
                                    b = b + ("&rel=" + x),
                                    b = b + ("&lang=" + u),
                                    b = b + ("&tk=" + z),
                                    b = b + ("&tl=" + (L(C) ? C : encodeURIComponent(C))),
                                    b = b + ("&loop=" + M);
                                    // b = b + ("&t=" + y);

                                h !== q ?
                                    (m = d.createElement("div"),
                                            x = m.style, x.width = "100%",
                                            m.setAttribute("data-frontdomain", a.frontUrl),
                                            m.setAttribute("data-staticdomain", a.staticUrl),
                                        h === k && (x.height = H + "px"),
                                            x.maxWidth = n + "px", x.maxHeight = H + "px"
                                    )
                                    : m = d.createElement("a");

                                switch (h) {
                                    case k:
                                        p = p + "flv2.swf?t=" + y;
                                        m.innerHTML = '' +
                                            '<object ' +
                                            'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ' +
                                            'codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" ' +
                                            'wmode="transparent" width=100%" height="100%" id="flv2" align="middle">' +
                                            '<param name="allowScriptAccess" value="sameDomain" />' +
                                            '<param name="movie" value="' + p + '"/>' +
                                            '<param name="quality" value="high" />' +
                                            '<param name="bgcolor" value="#000000" />' +
                                            '<param name="allowFullScreen" value="true" />' +
                                            '<param name="wmode" value="direct">' +
                                            '<param name="FlashVars" value="' + b + '" />' +
                                            '<embed src="' + p + '" flashvars="' + b + '" quality="high" bgcolor="#000000" wmode="direct" width="100%" height="100%" name="flv2" align="middle" allowScriptAccess="sameDomain" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" allowFullScreen="true" />' +
                                            '</object>';
                                        break;
                                    case "h":
                                        m.id = "fc2videohtml5cont" + E;
                                        m.className = "FC2VIDEOPLAYER";
                                        m.setAttribute("data-flashvars", b);
                                        break;
                                    case q:
                                        b = 0 <= r.indexOf("vip.cvideoimgs") ? r : 4 <= r.length ? "vip.video" + r + "-thumbnail.fc2.com" :
                                        "video" + r + "-thumbnail.fc2.com", "cn" == u && (b = b.replace("fc2.com", w)), m.setAttribute("href", p + A + D + "content/" + v + "/&otag=1&tk=" + z + "&utm_source=" + B + "&utm_medium=html&utm_campaign=outer_html5click"), m.setAttribute("target", "_blank"), m.innerHTML = '<img src="http://' + b + "/up/pic/" + v.substring(0, 6) + "/" + v.substring(6, 8) + "/" + v.charAt(14) + "/" + v.charAt(15) + "/" + v + '.jpg">' + (C ? "<br/>" + C : "") + "<br/>"
                                }
                                player = document.getElementById('player');
                                player.appendChild(m);
                                // l.parentNode.insertBefore(m, l);
                                F.push({dom: m, width: n, height: H});
                                p = d.createElement("iframe");
                                u = G(B);
                                p.setAttribute("src",
                                    u);
                                p.setAttribute("height", "1");
                                p.setAttribute("width", "1");
                                p.setAttribute("style", "display:none;");
                                player.appendChild(p);
                                // l.parentNode.insertBefore(p, l)
                            }
                        }
                    }
                    e();
                    "h" === h && function (b) {
                        var c = b.getElementsByTagName("script")[0], d = a.staticUrl + "videoplayer/out/js/fc2videoplayer_v2.min.js?" + y + "a1111";
                        I && (d = a.frontUrl + "videoplayer/out/js/fc2videoplayer_v2.min.js?" + (new Date).getTime());
                        b.getElementById("fc2videoplayer") || (b = b.createElement("script"), b.id = "fc2videoplayer", b.src = d, c.parentNode.insertBefore(b, c))
                    }(document);
                    "p" != h &&
                    (c.addEventListener ? c.addEventListener("resize", g, !1) : c.attachEvent && c.attachEvent("onresize", g))
                };

            console.log('after A');

            (function () {
                console.log('function in a.exec');

                for (var c = document.getElementsByTagName("script"), e = c.length, d = 0; d < e; d++) {
                    var h = c[d];
                    if (f(h, "url")) {
                        var k = f(h, "url").match(K);
                        if (16 == (k && k[4] ? k[4] : "").length) {
                            "http://video.fc2.com/" == k[1] ? (a.frontUrl = "http://video.fc2.com/",
                                a.staticUrl = "http://static.fc2.com/video/")
                                : (a.frontUrl = s, a.staticUrl = "http://static.fc2id.com/video/");

                            com.fc2.video.test = I = -1 !== h.src.indexOf(".test.");
                            break
                        }
                    }
                }
                console.log('function in a.exec finish')
            })();

            console.log(h);
            console.log(k);
            a.staticUrl
            && a.frontUrl
            && ("h" === h ?
                z(a.frontUrl + "videoplayer/out/timestamp.php", A)
                : h === k
                ? z(a.frontUrl + "flv2_timestamp.php", A)
                : A())
            console.log('finish')
        };
        console.log('entry point');
        G(a.exec)
    }
})();