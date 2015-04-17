chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.executeScript({
    code: "snowflake.toggleScript();"
  });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type == "copy"){
    $("#clipboard").show().val(request.text).select();
    document.execCommand("Copy");
    $("#clipboard").hide();

    sendResponse({message: "Copied to clipboard!"});
  }
});