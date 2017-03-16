var passwordChanged = false;

function findRoleById (id) {
  var result = null;

  $.each(allRoles, function (index, r) {
    if (r['_id'] == id) {
      result = r;
      return false;
    }
  });

  return result;
}

function updateRoleList () {
  $('#roleList').empty();

  $.each(selectedRoleIds, function (index, id) {
    var r = findRoleById(id);
    $('#roleList').append('<option value="' + id + '">' + r['name'] + '</option>');
  });
}

$(function () {
  $('.selectpicker').selectpicker();

  updateRoleList();

  $('#rolesModal').on('show.bs.modal', function (e) {
    $.each(selectedRoleIds, function (index, id) {
      $('#role_' + id).prop('checked', true);
    });

    $('#okButton').prop('class', 'btn btn-primary');
    $('#okButton').prop('disabled', false);
  });

  $('#okButton').click(function () {
    selectedRoleIds = [];

    $('.role-checkbox').each(function () {
      if ($(this).prop('checked')) {
        var n = $(this).prop('name');
        var r = findRoleById(n);
        selectedRoleIds.push(r['_id']);
      }
    });

    updateRoleList();
    $('#rolesModal').modal('hide');
  });

  $('#password').change(function() {
    passwordChanged = true;
  });
});

function prepareRoles () {
  $('#roles').prop('value', JSON.stringify(selectedRoleIds));

  if (passwordChanged) {
    var hash = CryptoJS.SHA1($('#password').prop('value'));
    $('#password').prop('value', hash);
  };
}

function updateOKButton () {
  var none = true;

  $('.role-checkbox').each(function () {
    if ($(this).prop('checked')) {
      none = false;
      return false;
    }
  });

  if (none) {
    $('#okButton').prop('class', 'btn btn-disabled');
    $('#okButton').prop('disabled', true);
  } else {
    $('#okButton').prop('class', 'btn btn-primary');
    $('#okButton').prop('disabled', false);
  }
}
