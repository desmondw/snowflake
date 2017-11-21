// clicking the icon
chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.executeScript({
    code: "toggleSelection()"
  })
})

// pressing the hotkey
chrome.commands.onCommand.addListener(function(command) {
  if (command == 'toggle-selection') {
    chrome.tabs.executeScript({
      code: "toggleSelection()"
    })
  }
})

// clipboard magic
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type == "copy"){
    $("#clipboard").show().val(request.text).select()
    document.execCommand("Copy")
    $("#clipboard").hide()

    sendResponse({message: "Copied to clipboard!"})
  }
})