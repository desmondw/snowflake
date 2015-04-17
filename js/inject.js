// TODO
// ------------
// VISUALS
  // Design icon
  // Design options page
  // Redesign highlight box, selector box, popup alert
// BUGS
  // Stop event propogation for clicks - need help
  // Handle svg elements (example: https://github.com/desmondw/snowflake/graphs/contributors?from=2014-11-02&to=2015-04-16&type=c)



// allow user to identify unique css selectors by hovering over them
// calling during active execution will cleanup and end the script
var snowflake = {
  DEV_MODE       : 0,    // for testing
  HIGH_BORDER    : 2,    // highlight box
  SEL_BORDER     : 1,    // selector box
  SEL_MIN_WIDTH  : 250,  // selector box
  UI_PADDING     : 2,    // all visual containers

  settings: {
    copyAsJquery: 1
  },
  selector : "",

  loadSettings: function(){
    console.log("loading settings");
    chrome.storage.sync.get({
      copyAsJquery: 1
    }, function(savedSettings) {
      console.log(savedSettings.copyAsJquery);
      snowflake.settings.copyAsJquery = savedSettings.copyAsJquery;
    });
  },

  toggleScript: function(){
    if ($('.sf-all').length){ // if script running
      if ($('.sf-ui').length) // if ui was active, end script
      {
        snowflake.cleanupScript();
        return;
      }
      snowflake.cleanupScript(); // else clear alert and continue
    }

    $('body').append('<div class="sf-all sf-ui" id="sf-highlight"></div>');
    $('body').append('<div class="sf-all sf-ui" id="sf-selector"></div>');

    $(document).bind("mouseover.sf", snowflake.identify)
    $(document).bind("mousewheel.sf", function(){
      setTimeout(function(){ snowflake.identify(e); }, 0);
    });
    $(document).bind("click.sf", snowflake.copySelector);
  },

  // highlights the given element and displays a unique CSS selector for it
  identify: function(e){
    e.stopPropagation();
    var el = document.elementFromPoint(e.clientX, e.clientY);

    selector = snowflake.generateSelector(el);
    $('#sf-selector').html(selector);
    snowflake.drawOverlay(el);

    $(el).mouseout(function(){
      $('#sf-highlight').hide();
      $('#sf-selector').hide();
    })
  },

  // creates a unique css selector for the given element
  generateSelector: function(el){
    var selector = "";
    var tree = $(el).parentsUntil(document);

    // generate full selector by traversing DOM from bottom-up
    for (var i = -1; i < tree.length; i++){
      var e = i < 0 ? el : tree[i];
      
      var eCSS = snowflake.querifyElement(e);
      var query = eCSS.query + (selector.length ? ' > ' : '') + selector;

      var matches = $(query);
      snowflake.log("QUERY: " + query);

      if (matches.length === 1 && matches[0] === el){
        snowflake.log('   single match (result)');
        return query;
      }
      else if (matches.length > 1 && i + 1 < tree.length){
        snowflake.log('   many matches');

        var parentQuery = snowflake.generateSelector(tree[i + 1]);
        var parentMatches = $(parentQuery).children(eCSS.tag);
        var nthQuery = eCSS.tag + ':nth-of-type(' + (parentMatches.index(el) + 1) + ')' + (selector.length ? ' > ' : '') + selector;
        var parentNthQuery = parentQuery + ' > ' + nthQuery;
        var nthMatches = $(parentNthQuery);

        snowflake.log("PARENT_QUERY: " + parentQuery);
        snowflake.log("__ELEMENT__");
        snowflake.log(e)
        snowflake.log("__PARENT__");
        snowflake.log($(parentQuery)[0])
        snowflake.log("__PARENT_MATCHES__");
        snowflake.log(parentMatches)
        snowflake.log("PARENT_NTH_QUERY: " + parentNthQuery);

        if (nthMatches.length === 1 && nthMatches[0] === el){
          snowflake.log('   single match with nth-of-type (result)');
          return parentNthQuery;
        }
        else {
          // snowflake.log('   many matches with nth-of-type (continue)');
          // selector = nthQuery;
          snowflake.log("----------")
          return 'ERROR';
        }
      }
      else {
        if (matches.length === 1) snowflake.log("Matched incorrect element. (matches.length = " + matches.length + ")")
        else if (matches.length > 1) snowflake.log("Multiple matches, but traversed entire tree (algorithm not being specific enough).")
        else snowflake.log("Could not find match for tag/id/class selector. (matches.length = " + matches.length + ")")
        return 'ERROR';
      }
      snowflake.log("");
    }

    return selector;
  },

  // returns object with element information in query format
  querifyElement: function(e){
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
  },

  // draw the highlight box and selector tooltip to the screen
  drawOverlay: function(el){
    var top = $(el).offset().top - $(window).scrollTop();
    var left = $(el).offset().left - $(window).scrollLeft();
    var bottom = top + $(el).outerHeight();

    $('#sf-highlight').show()
      .css('width', $(el).outerWidth() - snowflake.HIGH_BORDER + 'px')
      .css('height', $(el).outerHeight() - snowflake.HIGH_BORDER + 'px')
      .css('top', top + 'px')
      .css('left', left + 'px');

    // x pos of selector box
    var selectorLeftPad = $(window).outerWidth() - left - snowflake.SEL_MIN_WIDTH - snowflake.SEL_BORDER;
    selectorLeftPad = selectorLeftPad < 0 ? selectorLeftPad : 0;

    $('#sf-selector').show()
      .css('left', left + selectorLeftPad + 'px');

    // y pos of selector box
    var selectorTop = top - $('#sf-selector').outerHeight() - snowflake.UI_PADDING;
    var selectorBottom = bottom + snowflake.HIGH_BORDER + snowflake.UI_PADDING;

    var selectorPos = snowflake.UI_PADDING;
    if (selectorTop > 0)
      selectorPos = selectorTop;
    else if (selectorBottom + $('#sf-selector').outerHeight() < $(window).outerHeight())
      selectorPos = selectorBottom;

    $('#sf-selector').css('top', selectorPos + 'px')
  },

  // copy the generated CSS selector to the clipboard
  copySelector: function(e){
    e.preventDefault();
    e.stopPropagation(); // TODO: Doesn't work
    e.stopImmediatePropagation();
    var copyText = snowflake.settings.copyAsJquery ? "$('" + selector + "')" : selector;
    chrome.runtime.sendMessage({type: "copy", text: copyText}, function(response) {
      snowflake.cleanupScript(response.message);
    });
  },

  // display a popup message at the top of the screen that fades away
  fadeAlert: function(message, callback){
    $('body').append('<div class="sf-all" id="sf-alert">' + message + '</div>');
    $("#sf-alert").css('left', $(window).outerWidth() / 2 - $("#sf-alert").outerWidth() / 2)
                  .css('top', 0);
    setTimeout(function(){
      $("#sf-alert").fadeOut(1500, callback);
    }, 1500);
  },

  // print an error to the console
  log: function(message){
    if (snowflake.DEV_MODE)
      console.log('sf-Error: ' + message);
  },

  // tidy up script and provide an optional message to the user
  cleanupScript: function(message){
    $(document).unbind(".sf")

    if (message){
      $('.sf-ui').remove();
      snowflake.fadeAlert(message, function(){
        $('.sf-all').remove();
      });
    }
    else
      $('.sf-all').remove();
  }
};

snowflake.loadSettings();