var googlemapsapikey = '';

function updateImgBorders() {
	$('img').each(function(index, image) {
		if (($(image).width() < 100) && ($(image).height() < 100)) {
			$(image).attr("exif", false);
			return;
		}
		$(image).exifLoad(function() {
			var aLat = $(image).exif("GPSLatitude")[0];
			var aLon = $(image).exif("GPSLongitude")[0];

			$(image).attr("exif", !(typeof aLat === 'undefined' || typeof aLon === 'undefined' || aLat == 0 || aLon == 0));
			$(image).context.onmousedown = function(event){
				if(event.button == 2)
					chrome.runtime.sendMessage({method: 'updateMenu', hasmap: event.srcElement.attributes.getNamedItem('exif').value});
			};

			if('true' !== $(image).attr("exif"))
				return;

			var strLatRef = $(image).exif("GPSLatitudeRef")[0]  || "N";
			var strLonRef = $(image).exif("GPSLongitudeRef")[0] || "W";

			var fLat = (aLat[0] + aLat[1] / 60 + aLat[2] / 3600) * (strLatRef === "N" ? 1 : -1);
			var fLon = (aLon[0] + aLon[1] / 60 + aLon[2] / 3600) * (strLonRef === "W" ? -1 : 1);
			// 53°20′18″N,37°5′18″E
			var sLat = '' + Math.round(aLat[0]) + '°' + Math.round(aLat[1]) + '′' + Math.round(aLat[2]) + "″" + strLatRef;
			var sLon = '' + Math.round(aLon[0]) + '°' + Math.round(aLon[1]) + '′' + Math.round(aLon[2]) + "″" + strLonRef;

			$(image).attr("data-gps-latitude", fLat);
			$(image).attr("data-gps-longitude", fLon);
			$(image).attr("data-gps-latitude-pretty", sLat);
			$(image).attr("data-gps-longitude-pretty", sLon);
			chrome.runtime.sendMessage(
				{ method: 'getAddressByLatLng', lat: fLat.toFixed(7), lon: fLon.toFixed(7) },
				function(response) {
					if(response && response.address)
					{
						var title = $(image).context.getAttribute("title");
						title = (
									(title === 'undefined' || title === null || title === '' || title.match(/^\[.*?\]$/)
								) ? '@ ' : title + "\n@ ") + response.address;
						$(image).attr("title", title);
					}
				}
			);
			$(image).css({
			  "border-color": $('#exifspyborderexample').css('border-color'),
			  "border-width": $('#exifspyborderexample').css('border-width'),
			  "border-style": "solid"
			});
		});
	});
};

$(document).ready(function() {
	$("body").append("<div id='exifspyborderexample' style='border: maroon 1px solid; display: none;'></div>");

	chrome.storage.onChanged.addListener(function(changes, namespace) {
		if (typeof changes['googlemapsapikey'] !== 'undefined') {
			googlemapsapikey = changes['exifspybordercolor'];
		}
		if (typeof changes['exifspybordercolor'] !== 'undefined') {
			$('#exifspyborderexample').css('border-color', changes['exifspybordercolor']);
		}
		if (typeof changes['exifspyborderwidth'] !== 'undefined') {
			$('#exifspyborderexample').css('border-width', changes['exifspyborderwidth']);
		}
		updateImgBorders();
	});

	chrome.storage.sync.get({
			googlemapsapikey: '',
			exifspybordercolor: 'maroon',
			exifspyborderwidth: '1px'
		}, function(items) {
			googlemapsapikey = items.googlemapsapikey;
			$('#exifspyborderexample').css('border-color', items.exifspybordercolor);
			$('#exifspyborderexample').css('border-width', items.exifspyborderwidth);
		});
	updateImgBorders();

});

