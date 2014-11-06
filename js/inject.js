// Fix highlighting / border overlay ...Muhammed
// Fix tooltip
// Copy to clipboard ...need to select on screen?
// Add more selector specificity

activate();

function activate() {
  var el;

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

    // $(el).addClass('ob-highlight');
    // $(el).attr('data-selector', selector)
    $(el).append('<div class="ob-overlay"></div>')
    $('.ob-overlay')
      .css('width', $(el).outerWidth() + 'px')
      .css('height', $(el).outerHeight() + 'px')
      .css('top', $(el)[0].offsetTop + 'px')
      .css('left', $(el)[0].offsetLeft + 'px')
    $(el).append('<div class="ob-selectors">' + selector + '</div>')
    $('.ob-selectors')
      .css('top', $(el)[0].offsetTop - $('.ob-selectors').outerHeight() - 10 + 'px')
      .css('left', $(el)[0].offsetLeft + 'px')

    // $(el).append('<div class="ob-overlay"></div>')
    //   .css('width', $(el).width)
    //   .css('height', $(el).height)
    //   .css('top', $(el)[0].clientY - $('.ob-overlay').height - 10)
    //   .css('left', $(el)[0].clientX)

    $(el).mouseout(function(){
      $(el).removeClass('ob-highlight');
      $(el).attr('data-selector', '')
      $(el).find('.ob-overlay').remove();
      $(el).find('.ob-selectors').remove();
    })
  })
  $(document).click(function(){
    $('.ob-selectors').focus();
    document.execCommand('SelectAll');
    document.execCommand("Copy", false, null);
    console.log('Copied!')
  })
}
