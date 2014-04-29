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

chrome.runtime.onMessage.addListener(function(message){
	if(message.method === "showLocation" && message.lat && message.lon) {
		// https://www.google.com/maps/place/41°22'52.0"N+2°07'12.0"E
		var mapsUrl = "https://www.google.com/maps/place/" + message.lat + "+" + message.lon;
		chrome.tabs.create( {url:mapsUrl} );
	} else if(message.method === "updateMenu" && message.hasmap) {
		chrome.contextMenus.update(showMapItem, {enabled: 'true' === message.hasmap}, function(cb) {});
	}
});
