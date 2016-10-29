(function get_source(){
  if (document.createRange) { // Rangeオブジェクト多用してるのでこれが使えないとお話にならない
    var range = document.createRange();
    var elm = document.getElementById("url")
    range.selectNodeContents(document.documentElement);
    var xhr = new window.ActiveXObject("MSXML2.XMLHTTP"); // XHRオブジェクト生成
    xhr.open("GET", elm.value, true);

    // ここでUser-Agentを指定します。
    xhr.setRequestHeader("User-Agent", 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.124 Safari/537.36');

    // ここでキャッシュを無効にして 304 が返らないようにします。
    xhr.setRequestHeader("Pragma", "no-cache");
    xhr.setRequestHeader("Cache-Control", "no-cache");
    xhr.setRequestHeader("If-Modified-Since", "Thu, 01 Jun 1970 00:00:00 GMT");

    // 非同期通信なので必須
    xhr.onreadystatechange = function(){
      if (xhr.readyState===4 && xhr.status===200) {
        var root = document.documentElement,
        // 現在の head, body をコピーしておきます。
        oldHead = document.getElementsByTagName("head")[0].cloneNode(false),
        oldBody = document.body.cloneNode(false),
        // 新しいリクエストで取得する head, body の中身をそれぞれ格納します。
        newElem = [null, null],
        // DocumentFragment の中に入ると head や body が消えてしまうので、予め分割しておきます。
        texts = xhr.responseText.split(/<body[^>]*>/);

        // IE10からは Range#createContextualFragment が使えます。
        // if の分岐後、やってることは同じです。
        if (range.createContextualFragment) {
          newElem[0] = range.createContextualFragment(texts[0]);
          newElem[1] = range.createContextualFragment(texts[1]);
        }
        else {
          var div = document.createElement("div");
          for (var i in newElem) {
            div.innerHTML = texts[i];
            range.selectNodeContents(div);
            newElem[i] = range.extractContents();
          }
        }

        // head の中身を入れ替えます。
        // 一旦 head ごと削除し、コピーしておいた空の head を追加し、さらにその中に新しい中身を追加しています。
        range.selectNode(document.getElementsByTagName("head")[0]);
        range.deleteContents();
        root.appendChild(oldHead);
        document.getElementsByTagName("head")[0].appendChild(newElem[0]);

        // body の中身を入れ替えます。
        // 同上
        range.selectNode(document.body);
        range.deleteContents();
        root.appendChild(oldBody);
        document.body.appendChild(newElem[1]);
      }
    };
    document.getElementById("source").value = xhr.send();
  }
})();