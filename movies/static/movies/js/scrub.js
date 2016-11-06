function change() {
    $('.movie_thumbnail')
}

$(function () {
    $('html:not(.touch) a.scrub').click(function () {
        var videThumbSmall = $(this).closest('.video_thumb_small');
        var id = videThumbSmall.attr('data-up-id');
        var title = videThumbSmall.attr('alt');
        var url = videThumbSmall.attr('url');
        var sj = videThumbSmall.attr('sj');
        // $.getScript("http://static.fc2.com/video/js/outerplayer.min.js",url="http://video.fc2.com/en/a/content/20160914FzLVA5Ln/",tk="T0RNd09EQXpOVE09",tl="妹妹第一次看A書 忽然慾火難耐..", sj="81000", d="3653", w="640", h="392", charset="UTF-8");
        $(".player").css('display', 'block');
        // $('#embed_video').attr('src', "http://video.fc2.com/flv2.swf?i=" + id);
        $("a.player_title").attr('href', url);
        $("a.player_title strong").text(title);

        var dl_button = $("button.download");
        dl_button.attr('onclick', "location.href='" + dl_button.attr('value') + "?target=" + id + "'");

        var width = 640;
        var height = 392;
        var duration = videThumbSmall.attr('data-duration');
        var tk = "TXpVNE1Ea3dOVFE9";

        var p = 'http://video.fc2.com/flv2.swf';
        var b = "i=" + id +"&d=" + duration +"otag=1" + "&sj=" + sj + "&rel=1" + "&lang=ja" + "&tk=" + tk + "&tl=" + (encodeURIComponent(title)) + "&loop=0";

        // player = '<object classid="" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" wmode="transparent" width="' + width + '" height="' + height + '" id="flv2" align="middle"><param name="allowScriptAccess" value="sameDomain" /><param name="movie" value="http://video.fc2.com/flv2.swf?i=' + id + '" /><param name="quality" value="high" /><param name="bgcolor" value="#ffffff" /><param name="allowFullScreen" value="true" /><embed src="http://video.fc2.com/flv2.swf?i=' + id + '" quality="high" bgcolor="#ffffff" wmode="transparent" width="' + width + '" height="' + height + '" name="flv2" align="middle" allowScriptAccess="sameDomain" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" allowFullScreen="true" /></object>';
        player = '<object ' +
            'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ' +
            'codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" ' +
            'wmode="transparent" width="' + width + '" height="' + height + '" id="flv2" align="middle">' +
            '<param name="allowScriptAccess" value="sameDomain" />' +
            '<param name="movie" value="' + p + '"/>' +
            '<param name="quality" value="high" />' +
            '<param name="bgcolor" value="#000000" />' +
            '<param name="allowFullScreen" value="true" />' +
            '<param name="wmode" value="direct">' +
            '<param name="FlashVars" value="' + b + '" />' +
            '<embed src="' + p + '" flashvars="' + b + '" quality="high" bgcolor="#000000" wmode="direct" width="' + width + '" height="' + height + '" name="flv2" align="middle" allowScriptAccess="sameDomain" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" allowFullScreen="true" />' +
            '</object>';

        $("#player").html(player);
        // $('#player').find('object').attr('width', width);
        // $('#player').find('object').attr('height', height);
        // $('#player').find('embed').attr('width', width);
        // $('#player').find('embed').attr('height', height);
        // $('#player').css('width', width);
        window.scrollTo(0, 50);
        return false;
    });
});

// $(function(){
//       $('html:not(.touch) a.scrub').click(function () {
//           if (!$("#player").length){
//               $('.row').before('<div id="player"> test </div>');
//           }
//
//           //動画ID名を入れたら#nico_playerに外部プレイヤーを追加する関数
//           function setVideo(id) {
//               document._write = document.write;
//               document.write = function (msg) {
//                   $("#player").html(msg);
//                   //document.writeを元に戻す
//                   document.write = document._write;
//               };
//               var dst = $("<scr" + "ipt>");
//               dst.attr("type", "text/javascript");
//               dst.attr("src", "http://static.fc2.com/video/js/outerplayer.min.js");
//               dst.attr("url", "http://video.fc2.com/en/a/content/20160914FzLVA5Ln/");
//               dst.attr("tk", "T0RNd09EQXpOVE09");
//               dst.attr("tk", "妹妹第一次看A書 忽然慾火難耐..");
//               dst.attr("sj", "81000");
//               dst.attr("d", "3653");
//               dst.attr("w", "640");
//               dst.attr("h", "392");
//               dst.attr(charset="UTF-8");
//               //追加する
//               $("body").append(dst);
//           }
//
//           setVideo("sm20992194");
//
//           //ボタンを押したら変更させる
//           return false;
//       });
// });


$(function () {
    $('html:not(.touch) a.scrub').mousemove(function (e) {

        var scrub = $(this);
        var width = 120, height = 90, maxLength = 68, margin = 5, position = 0, x = 0, y = 0;

        var videThumbSmall = scrub.closest('.video_thumb_small');
        //var upDuration = getDuration(videThumbSmall.attr('data-duration'));
        var upDuration = 0;

        if (videThumbSmall.attr('data-duration').indexOf(':') == -1) {
            upDuration = videThumbSmall.attr('data-duration');
        } else {
            upDuration = getDuration(videThumbSmall.attr('data-duration'));
        }

        width = videThumbSmall.width();
        height = videThumbSmall.height();

        var imagewidth = width;
        var imageheight = height;

        var upIntervalSeekThumbnail = getIntervalTime(upDuration);
        var maxFrame = Math.floor((upDuration / upIntervalSeekThumbnail + 1) / 1.5); // don't show till the end
        var positionY = e.pageX - scrub.offset().left - margin;
        if (!scrub.hasClass('setup')) {
            scrub.addClass('setup');
            setTimeout(function () {
                scrub.find('.scrubber').show();
                var upId = videThumbSmall.attr('data-up-id');
                var seekThumbnail = '';
                var nothumnail = videThumbSmall.attr('data-nothumnail');
                var img = $(new Image());

                if (nothumnail) {
                    // 20130322 #33055 nozaki
                    seekThumbnail = getSeekPathNoThumb(nothumnail, upId);
                } else if (scrub.find('img').attr('src').indexOf('FCUT_') == -1) {
                    seekThumbnail = scrub.find('img').attr('src').replace(upId, 'seek_' + upId);
                } else {
                    seekThumbnail = scrub.find('img').attr('src').replace('FCUT_', 'seek_');
                    seekThumbnail = seekThumbnail.replace('.gif', '.jpg');
                }
                img.attr('src', seekThumbnail);
                img.load(function () {
                    for (i = 0; i < maxFrame; i++) {
                        x = i * width;
                        if (maxLength <= i) {
                            x = (i - maxLength) * width;
                            y = height;
                        }
                        scrub.prepend('<div style="background:url(' + seekThumbnail + ');background-position:-' + x + 'px -' + y + 'px; background-size:' + maxLength * width + 'px;" data-seek="' + i + '" class="seek"></div>');
                    }
                    scrub.find('.scrubber').css('background', '');
                });
            }, 500);
        }

        if (scrub.find('div[data-seek=' + (maxFrame - 1) + ']').hasClass('seek')) {
            positionY /= 1.5;
            if (width < positionY) {
                position = width;
            } else {
                if (positionY < 0) {
                    position = 0;
                } else {
                    position = positionY;
                }
            }

            var i = Math.floor((position / (imagewidth - margin * 2)) * maxFrame) - 1;

            if (maxFrame < i) {
                i = maxFrame;
            }
            if (i < 0) {
                i = 0;
            }

            scrub.find('img:visible').hide();
            scrub.find('div[data-seek]').hide();
            scrub.find('div[data-seek=' + i + ']').show();
            scrub.find('.scrubber').show();
            scrub.find('.scrubbed').width(Math.round((i + 1) * 100 / maxFrame) + '%');
        }

    }).mouseleave(function () {
        var scrub = $(this);
        scrub.find('img').show();
        scrub.find('div[data-seek]').hide();
        scrub.find('.scrubber').hide();
        scrub.find('.scrubbed').width('0%');
    });

    function getDuration(duration) {
        result = duration.split(':');
        return parseInt(result[0]) * 60 + parseInt(result[1]);
    }

    function getSeekPathNoThumb(uri_root, id) {
        var url = uri_root + 'up/thumb/' + id.substring(0, 6) + '/' + id.substring(6, 8) + '/' + id.substring(8, 9) + '/seek_' + id + '.jpg';
        return url;
    }

    function getIntervalTime(duration) {
        if (duration < 180) {
            return 3;
        } else if (duration < 300) {
            return 5;
        } else if (duration < 600) {
            return 8;
        } else if (duration < 1200) {
            return 10;
        } else if (duration < 1800) {
            return 15;
        } else if (duration < 2400) {
            return 15;
        } else if (duration < 3000) {
            return 25;
        } else if (duration < 3600) {
            return 30;
        } else if (duration < 5400) {
            return 40;
        } else if (duration < 6300) {
            return 50;
        } else if (duration < 9900) {
            return 50;
        } else if (duration < 10800) {
            return 60;
        } else if (duration < 11700) {
            return 60;
        }

        return Math.floor(duration / 150);
    }
});

