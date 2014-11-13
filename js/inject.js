// Test highlighting / tooltip
// Copy to clipboard ...need to select on screen?
// Add more selector specificity
// Make only work on extension button click

activate();

function activate() {
  var el;

  $('body').append('<div class="ob-overlay"></div>')
  $('body').append('<div class="ob-selectors"></div>')

  $(document).mouseover(function(e){
    el = document.elementFromPoint(e.clientX, e.clientY);

    var selector = '';
    var tree = $(el).parentsUntil(document);

    for (var i = tree.length-1; i >= 0; i--){
      var e = tree[i];
      var str = e.tagName.toLowerCase();
      if (e.className) str += '.' + e.className.trim().split(' ').join('.')
      if (e.id) str += '#' + e.id.trim().split(' ').join('#')
      
      if (i < tree.length-1)
        selector += ' > ';
      selector += str;
    }

    console.log(selector)
    
    var border = 2;
    var top = $(el).offset().top - $(window).scrollTop();
    var left = $(el).offset().left - $(window).scrollLeft();
    $('.ob-overlay').show()
      .css('width', $(el).outerWidth() - border + 'px')
      .css('height', $(el).outerHeight() - border + 'px')
      .css('top', top + 'px')
      .css('left', left)
    $('.ob-selectors').show()
      .css('top', top - $('.ob-selectors').outerHeight() - 10 + 'px')
      .css('left', left)
    $('.ob-selectors').html(selector);

    $(el).mouseout(function(){
      $('.ob-overlay').hide();
      $('.ob-selectors').hide();
    })
  })
  $(document).click(function(){
    // $('.ob-selectors').focus();
    // document.execCommand('SelectAll');
    // document.execCommand("Copy", false, null);
    // console.log('Copied!')
  })
}
