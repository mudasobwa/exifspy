function updateImgBorders() {
  $('img').each(function(index, image) {
    if (($(image).width() > 100) && ($(image).height() > 100)) {
      $(image).exifLoad(function() {
        $(image).attr("exif", 'true');

        var aLat = $(image).exif("GPSLatitude")[0];
        var aLon = $(image).exif("GPSLongitude")[0];

        if (typeof aLat === 'undefined' || typeof aLon === 'undefined')
          return; // whoops, no GPS info

        var strLatRef = $(image).exif("GPSLatitudeRef") || "N";
        var strLonRef = $(image).exif("GPSLongitudeRef") || "W";

        var fLat = (aLat[0] + aLat[1] / 60 + aLat[2] / 3600) * (strLatRef === "N" ? 1 : -1);
        var fLon = (aLon[0] + aLon[1] / 60 + aLon[2] / 3600) * (strLonRef === "W" ? -1 : 1);
        // 53°20′18″N,37°5′18″E
        var sLat = '' + Math.round(aLat[0]) + '°' + Math.round(aLat[1]) + '′' + Math.round(aLat[2]) + "″" + strLatRef;
        var sLon = '' + Math.round(aLon[0]) + '°' + Math.round(aLon[1]) + '′' + Math.round(aLon[2]) + "″" + strLonRef;

        $(image).attr("data-gps-latitude", fLat);
        $(image).attr("data-gps-longitude", fLon);
        $(image).attr("data-gps-latitude-pretty", sLat);
        $(image).attr("data-gps-longitude-pretty", sLon);
        $(image).attr("title", "[" +
                $(image).attr("data-gps-latitude-pretty") + ", " +
                $(image).attr("data-gps-longitude-pretty") + "]");
        $(image).css({
          "border-color": $('#exifspyborderexample').css('border-color'),
          "border-width": $('#exifspyborderexample').css('border-width'),
          "border-style": "solid"
        });

        console.log("Set image itudes: [" +
                $(image).attr("data-gps-latitude-pretty") + ", " +
                $(image).attr("data-gps-longitude-pretty") + "]");
      });
    }
  });
};

$(document).ready(function() {
  $("body").append("<div id='exifspyborderexample' style='border: maroon 1px solid; display: none;'></div>");

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (typeof changes['exifspybordercolor'] !== 'undefined') {
      $('#exifspyborderexample').css('border-color', changes['exifspybordercolor']);
    }
    if (typeof changes['exifspyborderwidth'] !== 'undefined') {
      $('#exifspyborderexample').css('border-width', changes['exifspyborderwidth']);
    }
    updateImgBorders();
  });

  chrome.storage.sync.get({
    exifspybordercolor: 'maroon',
    exifspyborderwidth: '1px'
  }, function(items) {
    $('#exifspyborderexample').css('border-color', items.exifspybordercolor);
    $('#exifspyborderexample').css('border-width', items.exifspyborderwidth);
  });
  updateImgBorders();

});

