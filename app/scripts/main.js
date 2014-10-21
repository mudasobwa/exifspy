'use strict';

var jQuery = jQuery || null; // satisfying jslint
var $ = $ || jQuery || null; // satisfying jslint
var L = L || null;           // satisfying jslint

var exifSpyMap = exifSpyMap || null;
var exifSpyMarkers = exifSpyMarkers || [];

function handleLeaflet(iconsize, fLat, fLon, tooltip, hash) {
	if(!document.getElementById('expifspy-icon-mudasobwa-id')) {
		var icon = document.createElement('img');
		icon.id = 'expifspy-icon-mudasobwa-id';
		icon.src = chrome.extension.getURL('icons/maps.png');
		icon.alt = chrome.i18n.getMessage('leaflet_alt');
		icon.title = chrome.i18n.getMessage('leaflet_title');
		icon.width = iconsize;
		icon.style.position = 'fixed';
		icon.style.zIndex = 1000;
		icon.style.cursor = 'pointer';
		icon.style.top = icon.style.right = 0;
		icon.addEventListener('click', function() {
			var leaflet = document.getElementById('expifspy-leaflet-mudasobwa-id');
			if(leaflet) {
				leaflet.style.right = leaflet.style.right === '-10000px' ? (+iconsize - Math.floor(+iconsize / 8)) + 'px' : '-10000px';
			}
		}, false);
		document.body.appendChild(icon);
	}
	if(!document.getElementById('expifspy-leaflet-mudasobwa-id')) { /* create div to draw leaflet */
		var leaflet = document.createElement('div');
		leaflet.class = leaflet.id = 'expifspy-leaflet-mudasobwa-id';
		leaflet.style.position = 'fixed';
		leaflet.style.zIndex = 1001;
		leaflet.style.top = leaflet.style.right = (+iconsize - Math.floor(+iconsize / 8)) + 'px';
		leaflet.style.width = Math.min(window.innerWidth, 400) + 'px';
		leaflet.style.height = Math.min(window.innerHeight, 300) + 'px';
		leaflet.style.border = '1px solid #ddd';
		leaflet.style.right = '-10000px';
		document.body.appendChild(leaflet);
	}

	if(!exifSpyMap) {
		L.Icon.Default.imagePath = chrome.extension.getURL('lib/images');
		exifSpyMap = L.map('expifspy-leaflet-mudasobwa-id').setView([fLat, fLon], 13);

		// add an OpenStreetMap tile layer
		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(exifSpyMap);
	}

	// add a marker in the given location, attach some popup content to it and open the popup
	var marker = L.marker([fLat, fLon]).addTo(exifSpyMap).bindPopup(tooltip);

	marker.on('mouseover', function(/*e*/) {
		this.openPopup();
	});
	marker.on('mouseout', function(/*e*/) {
		this.closePopup();
	});

	if(hash) {
		marker.on('click', function(/*e*/) {
			location.hash = '#' + hash;
		});
	}

	exifSpyMarkers.push(L.latLng(fLat, fLon));
	exifSpyMap.fitBounds(L.latLngBounds(exifSpyMarkers));
}

function updateImgBorders(color, width, iconsize) {
	var counter = 0;
	$('img').each(function(index, image) {
		if (($(image).width() < 100) && ($(image).height() < 100)) {
			$(image).attr('exif', false);
			return true;
		}

		$(image).exifLoad(function() {
			var aLat = $(image).exif('GPSLatitude')[0];
			var aLon = $(image).exif('GPSLongitude')[0];

			$(image).attr('exif', !(!aLat || !aLon));
			$(image).context.onmousedown = function(event){
				if(event.button === 2) {
					chrome.runtime.sendMessage({method: 'updateMenu', hasmap: event.srcElement.attributes.getNamedItem('exif').value});
				}
			};

			if('true' !== $(image).attr('exif')) {
				return true;
			}

			counter += 1; // we yield an image with geotags

			var strLatRef = $(image).exif('GPSLatitudeRef')[0]  || 'N';
			var strLonRef = $(image).exif('GPSLongitudeRef')[0] || 'W';

			var fLat = (aLat[0] + aLat[1] / 60 + aLat[2] / 3600) * (strLatRef === 'N' ? 1 : -1);
			var fLon = (aLon[0] + aLon[1] / 60 + aLon[2] / 3600) * (strLonRef === 'W' ? -1 : 1);
			// 53°20′18″N,37°5′18″E
			var sLat = '' + Math.round(aLat[0]) + '°' + Math.round(aLat[1]) + '′' + Math.round(aLat[2]) + '″' + strLatRef;
			var sLon = '' + Math.round(aLon[0]) + '°' + Math.round(aLon[1]) + '′' + Math.round(aLon[2]) + '″' + strLonRef;

			$(image).attr('data-gps-latitude', fLat);
			$(image).attr('data-gps-longitude', fLon);
			$(image).attr('data-gps-latitude-pretty', sLat);
			$(image).attr('data-gps-longitude-pretty', sLon);

			var hash = 'img_' + Date.now();
			$('<a>').attr('id', hash).insertBefore($(image));

			chrome.runtime.sendMessage(
				{ method: 'getAddressByLatLng', id: counter, lat: sLat, lon: sLon },
				function(response) {
					var datas = JSON.parse(response.results).response.GeoObjectCollection;
					var address;
					if(datas) {
						for (var i = 0; i < datas.featureMember.length; i++) {
							if (datas.featureMember[i].GeoObject.metaDataProperty.GeocoderMetaData.precision === 'street') {
								address = datas.featureMember[i].GeoObject.metaDataProperty.GeocoderMetaData.text;
								break;
							}
						}
						if (address !== 'undefined') {
							var title = $(image).context.getAttribute('title');
							title = (!title || title.match(/^\[.*?\]$/) ? '@ ' : title + '\n@ ') + address;
							$(image).attr('title', title);
						}
					}
					handleLeaflet(iconsize, fLat, fLon, address ? address : sLat + ' ' + sLon, hash);
				}
			);
			$(image).css({
			  'border-color': color,
			  'border-width': width,
			  'border-style': 'solid'
			});
		});
	});
}

$(document).ready(function() {
	chrome.storage.onChanged.addListener(function(changes) {
		updateImgBorders(changes.exifspybordercolor, changes.exifspyborderwidth, changes.exificonsize);
	});

	chrome.storage.sync.get({
			googlemapsapikey: '',
			exifspybordercolor: 'maroon',
			exifspyborderwidth: '1px',
			exificonsize: 16
		}, function(items) {
			updateImgBorders(items.exifspybordercolor, items.exifspyborderwidth, items.exificonsize);
		});

});

