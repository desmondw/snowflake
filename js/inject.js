const IS_DEV = true // environment
const STICKY = true // if true, selection stays on browser when it loses focus a la chrome dev tools

const SEL_MIN_WIDTH  = 250 // selector box minimum width
const UI_PADDING     = 2   // all visual containers

var selector = ""

/**
 * toggleSelection - Starts/ends the script. Occurs when the icon is clicked or hotkey is pressed.
 */
function toggleSelection(){
  var isScriptRunning = $('.sf-ui').length

  cleanup()
  if (!isScriptRunning)
    initialize()
}

/**
 * initialize - Creates DOM elements needed to operate the script
 */
function initialize(){
    $('body').append('<div class="sf-all sf-ui" id="sf-highlight"></div>')
    $('body').append('<div class="sf-all sf-ui" id="sf-selector"></div>')
    $('body').addClass('sf-cursor')

    $(document).one("mousemove.sf", identify)
    $(document).bind("mouseover.sf", identify)

    $(document).bind("click.sf", preventListeners)
    $(document).bind("mouseup.sf", preventListeners)
    $(document).bind("mousedown.sf", copySelector)
}

/**
 * cleanup - Removes all DOM elements for the script
 */
function cleanup(){
  $(document).unbind(".sf")
  $(document).bind("mouseup.sf", (e)=>{ // delayed removal lets us avoid clicks bubbling up
    $('body').removeClass('sf-cursor')
    $(document).unbind(".sf")
  })
  $('.sf-all').remove()
}

/**
 * preventListeners - stops propogation of mouse events
 * @param  {Event} e
 */
function preventListeners(e){
  e.preventDefault()
  e.stopImmediatePropagation()
  e.stopPropagation()
}

/**
 * identify - highlights the given element and displays a unique CSS selector for it
 *
 * @param  {Event} e
 */
function identify(e){
  preventListeners(e)
  var el = document.elementFromPoint(e.clientX, e.clientY)

  selector = generateSelector(el)
  $('#sf-selector').html(selector)
  drawOverlay(el)

  if (!STICKY){
    $(el).mouseout(function(){
      $('#sf-highlight').hide()
      $('#sf-selector').hide()
    })
  }
}

/**
 * drawOverlay - draws all of the UI
 * @param  {Element} el the most top-level moused over element
 */
function drawOverlay(el){
  var top = $(el).offset().top - $(window).scrollTop()
  var left = $(el).offset().left - $(window).scrollLeft()
  var bottom = top + $(el).outerHeight()

  // highlight box
  $('#sf-highlight').show()
    .css('width', $(el).outerWidth() + 'px')
    .css('height', $(el).outerHeight() + 'px')
    .css('top', top + 'px')
    .css('left', left + 'px')

  // selector box (x)
  var selectorLeftPad = Math.min(window.innerWidth - left, 0)

  $('#sf-selector').show().css('left', left + selectorLeftPad + 'px')
  var selectorWidth = $('#sf-selector').outerWidth()
  if (selectorWidth + left > window.innerWidth)
    $('#sf-selector').css('left', window.innerWidth - selectorWidth + 'px')

  // selector box (y)
  var selectorTop = top - $('#sf-selector').outerHeight() - UI_PADDING
  var selectorBottom = bottom + UI_PADDING

  var selectorPos = UI_PADDING
  if (selectorTop > 0)
    selectorPos = selectorTop
  else if (selectorBottom + $('#sf-selector').outerHeight() < $(window).outerHeight())
    selectorPos = selectorBottom

  $('#sf-selector').css('top', selectorPos + 'px')
}

/**
 * generateSelector - creates a unique css selector for the given element
 *
 * @param  {Element} el The DOM element
 * @return {String} Unique CSS selector
 */
function generateSelector(el){
  var selector = ""
  var tree = $(el).parentsUntil(document)

  // generate full selector by traversing DOM from bottom-up
  for (var i = -1; i < tree.length; i++){
    var e = i < 0 ? el : tree[i]

    var eCSS = {
      element: e,
      tag: e.tagName.toLowerCase(),
      ids: e.id ? '#' + e.id.trim().split(' ').join('#') : "",
      classes: e.className ? '.' + e.className.trim().split(' ').join('.') : ""
    }
    eCSS.query = eCSS.tag + eCSS.ids + eCSS.classes
    var query = eCSS.query + (selector.length ? ' > ' : '') + selector
    var matches = $(query)
    // l(`QUERY: ${query}`)

    if (matches.length === 1 && matches[0] === el){ // single match (result)
      return query
    } else if (matches.length > 1 && i + 1 < tree.length){ // many matches
      var parentQuery = generateSelector(tree[i + 1])
      var parentMatches = $(parentQuery).children(eCSS.tag)
      var nthQuery = eCSS.tag + ':nth-of-type(' + (parentMatches.index(el) + 1) + ')' + (selector.length ? ' > ' : '') + selector
      var parentNthQuery = parentQuery + ' > ' + nthQuery
      var nthMatches = $(parentNthQuery)

      if (nthMatches.length === 1 && nthMatches[0] === el){ // single match with nth-of-type (result)
        return parentNthQuery
      } else {
        l('Unexpected error')
        return null
      }
    } else {
      if (matches.length === 1)
        l("Matched incorrect element. (matches.length = " + matches.length + ")")
      else if (matches.length > 1)
        l("Multiple matches, but traversed entire tree (algorithm not being specific enough).")
      else
        l("Could not find match for tag/id/class selector. (matches.length = " + matches.length + ")")
      return null
    }
  }

  return selector
}

/**
 * copySelector - Copies the generated CSS selector to the clipboard
 *
 * @param {Event} e
 */
function copySelector(e){
  preventListeners(e)
  var copyText = IS_DEV ? `$('${selector}')` : selector
  l(selector)
  l($(selector)[0], true)
  chrome.runtime.sendMessage({type: "copy", text: copyText}, function(response) {
    cleanup()
    fadeAlert(response.message)
  })
}

/**
 * fadeAlert - Displays a popup message at the top of the screen that fades away
 *
 * @param  {String} message
 */
function fadeAlert(message){
  var now = Date.now()
  $('body').append(`<div class="sf-all" id="sf-alert" class="${now}">${message}</div>`)
  $("#sf-alert").css('left', $(window).outerWidth() / 2 - $("#sf-alert").outerWidth() / 2)
                .css('top', 0)
  window.setTimeout(function(){
    $("#sf-alert").fadeOut(1500, function(){
      $(`#sf-alert.${now}`).remove()
    })
  }, 1000)
}

/**
 * l - Logging with prefixing that's limited to development
 *
 * @param  {String} message
 * @param  {bool} skipPrefix useful for printing objects
 */
function l(message, skipPrefix){
  if (IS_DEV)
    if (skipPrefix)
      console.log(message)
    else
      console.log(`Snowflake: ${message}\n`)
}
