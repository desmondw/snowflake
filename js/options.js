$(function(){
  get();
  $("input:radio[name='clipboard']").change(function(){
    set();
  });


  function get(){
    chrome.storage.sync.get({
      copyAsJquery: 1
    }, function(settings) {
      $("#clipboard-" + (settings.copyAsJquery ? "jquery" : "css")).prop("checked", true);
    });
  }

  function set(){
    chrome.storage.sync.set({
      copyAsJquery: !$("#clipboard-css").is(":checked")
    }, function(settings) {
      $("#status").html("Saved!").show().fadeOut(1000);
    });
  }
});