/** Opens new tab with google maps, opened at the place the photo was taken */
function getClickHandler(info, tab) {
  chrome.tabs.executeScript(tab.id, {code: "" +
    "var lat = null;" +
    "var lon = null;" +
    "for(var i = 0; i < document.images.length; ++i) {" +
    "   if(document.images[i].src === '" + info.srcUrl + "') {" +
    "      lat = document.images[i].getAttribute('data-gps-latitude-pretty');" +
    "      lon = document.images[i].getAttribute('data-gps-longitude-pretty');" +
    "      break;" +
    "   }" +
    "}" +
    "chrome.runtime.sendMessage({method:'showLocation',lat:lat,lon:lon});"
  });
};

/** Create a context menu which will only show up for images and selections. */
var showMapItem = chrome.contextMenus.create({
  "title" : chrome.i18n.getMessage("menuItemCaption"),
  "type" : "normal",
  "contexts" : ["image"],
  "onclick" : getClickHandler
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
	switch(message.method) {
		case "showLocation":
			// https://www.google.com/maps/place/41°22'52.0"N+2°07'12.0"E
			if(message.lat && message.lon)
				chrome.tabs.create( { url: "https://www.google.com/maps/place/" + message.lat + "+" + message.lon } );
			break;
		case "updateMenu":
			chrome.contextMenus.update(showMapItem, {enabled: 'true' === message.hasmap});
			break;
		case "getAddressByLatLng":
			var latlng = new google.maps.LatLng(Number(message.lat), Number(message.lon));
			var geocoder = new google.maps.Geocoder();
			geocoder.geocode( { latLng: latlng }, function(results, status) {
				switch(status) {
					case google.maps.GeocoderStatus.OK:
						sendResponse( { address: results[0] ? results[0].formatted_address : null } );
						console.log( { address: results[0] ? results[0].formatted_address : null } );
						break;
					case google.maps.GeocoderStatus.OVER_QUERY_LIMIT:
						setTimeout(function() {
							chrome.runtime.sendMessage( { method: 'getAddressByLatLng', lat: message.lat, lon: message.lon }, sendResponse );
						}, 200);
						break;
					case google.maps.GeocoderStatus.ZERO_RESULTS:
					default:
						console.log(status + ' (for latlng=[' + message.lat + ', ' + message.lon + '])');
				}
			});
			break;
	}
});

