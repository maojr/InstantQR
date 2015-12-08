// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

}

/**
 * @param {string} searchTerm - Search term for Google Image search.
 * @param {function(string,number,number)} callback - Called when an image has
 *   been found. The callback gets the URL, width and height of the image.
 * @param {function(string)} errorCallback - Called when the image is not found.
 *   The callback gets a string that describes the failure reason.
 */
function getImageUrl(searchTerm, callback, errorCallback) {
  var imageUrl = 'http://qr.liantu.com/api.php?text=' + searchTerm;
  callback(imageUrl);
}

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(url) {
    //Network condition check
    if (navigator.onLine == false) {
      renderStatus("请检查联网状况");
      return;
    }

    // Hints
    renderStatus('rendering');
    getImageUrl(url, function(imageUrl) {

      // Display the QR Code image
      var imageResult = document.getElementById('image-result');
      imageResult.src = imageUrl;
      imageResult.hidden = false;

      // imageURL represents the dom element in popup.html
      var imageURL = document.getElementById('image-url');
      // Add a document Element
      var a = document.createElement('a');
      var linkText = document.createTextNode("QR Link");
      a.appendChild(linkText);
      a.href = imageUrl;
      imageURL.appendChild(a);

    }, function(errorMessage) {
      renderStatus('Generate QR Code Image failed.' + errorMessage);
    });
  });
});

var img_url = document.getElementById("image-result");
img_url.addEventListener("load", function() {
  renderStatus("Generated");
});

//The chrome popup page's <a> is disabled.
//We use window'EventListener to finish it.
window.addEventListener('click',function(e){
  if(e.target.href!==undefined)
    chrome.tabs.create({url:e.target.href});
})
