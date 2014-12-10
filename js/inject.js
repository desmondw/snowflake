// fix scrolling again
// Stop event propogation for clicks (example case: google top-right profile pic)
// Improve UI/UX
// Replace unique "dw" identifiers with extension name
// Design icon
// Move project to own directory and add grunt for minification
// Test selector specificity

var HIGH_BORDER = 2; // highlight box
var SEL_BORDER = 1; // selector box
var SEL_MIN_WIDTH = 250; // selector box
var UI_PADDING = 2; // all visual containers
var COPY_AS_JQUERY = true; // copies to clipboard, ready to query

var selector = "";

// allow user to identify unique css selectors by hovering over them
// calling during active execution will cleanup and end the script
function toggleScript(){
  if ($('.dw-all').length){ // if script running
    if ($('.dw-ui').length) // if ui was active, end script
    {
      cleanupScript();
      return;
    }
    cleanupScript(); // else clear alert and continue
  }

  $('body').append('<div class="dw-all dw-ui" id="dw-highlight"></div>');
  $('body').append('<div class="dw-all dw-ui" id="dw-selector"></div>');

  $(document).bind("mouseover.dw", identify)
  $(document).bind("mousewheel.dw", function(){
    setTimeout(function(){ identify(e); }, 0);
  });
  $(document).bind("click.dw", copySelector);

  // highlights the given element and displays a unique CSS selector for it
  function identify(e){
    e.stopPropagation();
    var el = document.elementFromPoint(e.clientX, e.clientY);

    selector = generateSelector(el);
    $('#dw-selector').html(selector);
    drawOverlay(el);

    $(el).mouseout(function(){
      $('#dw-highlight').hide();
      $('#dw-selector').hide();
    })
  }

  // creates a unique css selector for the given element
  function generateSelector(el){
    var selector = "";
    var tree = $(el).parentsUntil(document);

    // generate full selector by traversing DOM from bottom-up
      console.clear();
    for (var i = -1; i < tree.length; i++){
      var e = i < 0 ? el : tree[i];
      
      var eCSS = querifyElement(e);
      var query = eCSS.query + (selector.length ? ' > ' : '') + selector;

      var matches = $(query);
      console.log("QUERY: " + query);

      if (matches.length === 1 && matches[0] === el){
        console.log('   single match (result)');
        return query;
      }
      else if (matches.length > 1 && i + 1 < tree.length){
        console.log('   many matches');

        var parentQuery = generateSelector(tree[i + 1]);
        var parentMatches = $(parentQuery).children(eCSS.tag);
        var nthQuery = eCSS.tag + ':nth-of-type(' + (parentMatches.index(el) + 1) + ')' + (selector.length ? ' > ' : '') + selector;
        var parentNthQuery = parentQuery + ' > ' + nthQuery;
        var nthMatches = $(parentNthQuery);

        console.log("PARENT_QUERY: " + parentQuery);
        console.log("__ELEMENT__");
        console.log(e)
        console.log("__PARENT__");
        console.log($(parentQuery)[0])
        console.log("__PARENT_MATCHES__");
        console.log(parentMatches)
        console.log("PARENT_NTH_QUERY: " + parentNthQuery);

        if (nthMatches.length === 1 && nthMatches[0] === el){
          console.log('   single match with nth-of-type (result)');
          return parentNthQuery;
        }
        else {
          // console.log('   many matches with nth-of-type (continue)');
          // selector = nthQuery;
          printError("----------")
          return 'ERROR';
        }
      }
      else {
        if (matches.length === 1) printError("Matched incorrect element. (matches.length = " + matches.length + ")")
        else if (matches.length > 1) printError("Multiple matches, but traversed entire tree (algorithm not being specific enough).")
        else printError("Could not find match for tag/id/class selector. (matches.length = " + matches.length + ")")
        return 'ERROR';
      }
      console.log("");
    }

    return selector;
  }

  // returns object with element information in query format
  function querifyElement(e){
    if (!e) return null;

    var tag = e.tagName.toLowerCase();
    var ids = e.id ? '#' + e.id.trim().split(' ').join('#') : "";
    var classes = e.className ? '.' + e.className.trim().split(' ').join('.') : "";
    var query = tag + ids + classes;

    return {
      element: e,
      tag: tag,
      ids: ids,
      classes: classes,
      query: query
    }
  }

  // draw the highlight box and selector tooltip to the screen
  function drawOverlay(el){
    var top = $(el).offset().top - $(window).scrollTop();
    var left = $(el).offset().left - $(window).scrollLeft();
    var bottom = top + $(el).outerHeight();

    $('#dw-highlight').show()
      .css('width', $(el).outerWidth() - HIGH_BORDER + 'px')
      .css('height', $(el).outerHeight() - HIGH_BORDER + 'px')
      .css('top', top + 'px')
      .css('left', left + 'px');

    // x pos of selector box
    var selectorLeftPad = $(window).outerWidth() - left - SEL_MIN_WIDTH - SEL_BORDER;
    selectorLeftPad = selectorLeftPad < 0 ? selectorLeftPad : 0;

    $('#dw-selector').show()
      .css('left', left + selectorLeftPad + 'px');

    // y pos of selector box
    var selectorTop = top - $('#dw-selector').outerHeight() - UI_PADDING;
    var selectorBottom = bottom + HIGH_BORDER + UI_PADDING;

    var selectorPos = UI_PADDING;
    if (selectorTop > 0)
      selectorPos = selectorTop;
    else if (selectorBottom + $('#dw-selector').outerHeight() < $(window).outerHeight())
      selectorPos = selectorBottom;

    $('#dw-selector').css('top', selectorPos + 'px')
  }

  // copy the generated CSS selector to the clipboard
  function copySelector(e){
    e.preventDefault();
    e.stopPropagation();
    var copyText = COPY_AS_JQUERY ? "$('" + selector + "')" : selector;
    chrome.runtime.sendMessage({type: "copy", text: copyText}, function(response) {
      cleanupScript(response.message);
    });
  }

  // display a popup message at the top of the screen that fades away
  function fadeAlert(message, callback){
    $('body').append('<div class="dw-all" id="dw-alert">' + message + '</div>');
    $("#dw-alert").css('left', $(window).outerWidth() / 2 - $("#dw-alert").outerWidth() / 2)
                  .css('top', 0);
    setTimeout(function(){
      $("#dw-alert").fadeOut(1500, callback);
    }, 1500);
  }

  // print an error to the console
  function printError(message){
    console.log('dw-Error: ' + message);
  }

  // tidy up script and provide an optional message to the user
  function cleanupScript(message){
    $(document).unbind(".dw")

    if (message){
      $('.dw-ui').remove();
      fadeAlert(message, function(){
        $('.dw-all').remove();
      });
    }
    else
      $('.dw-all').remove();
  }
}