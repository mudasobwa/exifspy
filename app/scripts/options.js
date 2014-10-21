'use strict';

// Saves options to chrome.storage
function saveOptions() {
	var googleMapsAPIKey = document.getElementById('googlemapsapikey').value;
	var bColor = document.getElementById('bordercolor').value;
	var bWidth = document.getElementById('borderwidth').value;
	var bIconSize = document.getElementById('iconsize').value;
	var bExample = document.getElementById('borderexample');

	bExample.style.borderColor = bColor;
	bExample.style.borderWidth = bWidth;
	bExample.style.borderStyle = 'solid';

	chrome.storage.sync.set({
		googlemapsapikey:   googleMapsAPIKey,
		exifspybordercolor: bColor,
		exifspyborderwidth: bWidth,
		exificonsize: bIconSize
	}, function() {
		// Update status to let user know options were saved.
		status.textContent = 'Options are saved.';
		setTimeout(function() {
		  status.textContent = '';
		}, 750);
	});
}

// Restores options from chrome.storage
function restoreOptions() {
	chrome.storage.sync.get({
		googlemapsapikey: '',
		exifspybordercolor: 'maroon',
		exifspyborderwidth: '1px',
		exificonsize: 32
	}, function(items) {
		document.getElementById('googlemapsapikey').value = items.googlemapsapikey;
		document.getElementById('bordercolor').value = items.exifspybordercolor;
		document.getElementById('borderwidth').value = items.exifspyborderwidth;
		document.getElementById('iconsize').value = items.exificonsize;
		var bExample = document.getElementById('borderexample');
		bExample.style.borderColor = items.exifspybordercolor;
		bExample.style.borderWidth = items.exifspyborderwidth;
		bExample.style.borderStyle = 'solid';
	});
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('googlemapsapikey').addEventListener('change', saveOptions);
document.getElementById('bordercolor').addEventListener('change', saveOptions);
document.getElementById('borderwidth').addEventListener('change', saveOptions);
document.getElementById('iconsize').addEventListener('change', saveOptions);
