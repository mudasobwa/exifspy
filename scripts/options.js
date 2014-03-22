// Saves options to chrome.storage
function save_options() {
  var b_color = document.getElementById('bordercolor').value;
  var b_width = document.getElementById('borderwidth').value;
  var b_example = document.getElementById('borderexample');
  b_example.style.borderColor = b_color;
  b_example.style.borderWidth = b_width;
  b_example.style.borderStyle = 'solid';

  chrome.storage.sync.set({
    exifspybordercolor: b_color,
    exifspyborderwidth: b_width
  }, function() {
    // Update status to let user know options were saved.
//    setTimeout(function() {
//      status.textContent = '';
//    }, 750);
  });
}

// Restores options from chrome.storage
function restore_options() {
  chrome.storage.sync.get({
    exifspybordercolor: 'maroon',
    exifspyborderwidth: '1px'
  }, function(items) {
    document.getElementById('bordercolor').value = items.exifspybordercolor;
    document.getElementById('borderwidth').value = items.exifspyborderwidth;
    var b_example = document.getElementById('borderexample');
    b_example.style.borderColor = items.exifspybordercolor;
    b_example.style.borderWidth = items.exifspyborderwidth;
    b_example.style.borderStyle = 'solid';
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('bordercolor').addEventListener('change', save_options);
document.getElementById('borderwidth').addEventListener('change', save_options);
