
$(function () {
  var $tabs = $('.tabs');

  $tabs.each(function (index, element) {
    var $element = $(element);
    var $buttons = $element.find('.tabs-navigation a');
    var $items = $element.find('.tabs-item');

    $buttons.on('click', function (e) {
      e.preventDefault();
      var index = $buttons.index(this);
      var $this = $(this);

      $this.parent('li').addClass("active");

      $buttons
        .not($this)
        .parent('li')
        .removeClass('active');

      $items
        .removeClass('active')
        .eq(index)
        .addClass('active');
    });
  });
});
