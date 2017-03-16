var secondaries = {};

$(function () {
  for (var i in subs) {
    var s = subs[i];
    addSubCategory(s.sname, s.scode);
  }

  $('#sc-table').on('click', '.rm-role', function() {
    $(this).closest('tr').remove();
  });

  $('#sc-add').click(function () {
    addSubCategory('', '');
  });

  $('#cat-form').submit(function () {
    var hasSubs = false;
    secondaries = {};

    $('#sc-table > tbody > tr').each(function() {
      var name = $('td:eq(0) input', this).val();
      var code = $('td:eq(1) input', this).val();

      if (name && code) {
        secondaries[code] = name;
        hasSubs = true;
      }
    });

    if (hasSubs) {
      $('[name="sub"]').prop('value', JSON.stringify(secondaries));
    } else {
      alert(noSubCat);
      return false;
    }
  });
});
