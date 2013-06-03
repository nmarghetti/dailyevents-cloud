Parse.initialize(
  // Development
  "uI57rIax4Tk31J5dI9EUKR3dCDhaeNphH2D0MmG1",
  "E9GTKYZBjxPHuI0YIajAeKAtSeWZ4wzXJfysRq4g"
  
  // Production
  // "Puuy52CoyWk3c5yOIubf3NPecyNdrNw7h4AAU7Qt",
  // "inthUDhs4EiQT81QwnZbpMUe70PbJvzBn5wzYF5b"
);

var data = new Object();

function registerClient() {
  data.clientId = $.cookie("clientId");
  if (!data.clientId)
    Parse.Cloud.run('register', { environment : navigator.userAgent }, {
      success : function(result) {
        data.clientId = result.id;
        $.cookie("clientId", data.clientId, { expires : 3650 });
      },
      error : function(error) {
        // TODO Show error message
      }
    });
}

function refreshGroup() {
  if (data.groupCode)
    Parse.Cloud.run('getGroupByCode', { code : data.groupCode }, {
      success : function(result) {
        if (result.id) {
          data.groupId   = result.id;
          data.groupName = result.name;
          document.title = data.groupName;
          $('#title').text(data.groupName);
          refreshEvent();
        }
        else {
          data.groupCode = null;
          enableOrDisableButtons();
        }
      },
      error : function(error) {
        // TODO Show error message
      }
    });
}

function refreshEvent() {
  var today = new Date();
  Parse.Cloud.run('getEvent', {
      groupId   : data.groupId,
      timestamp : today.getTime(),
      timezone  : today.getTimezoneOffset()
    }, {
    success : function(result) {
      var statuses = result.statuses;
      $("#participants").empty();
      for (var i in statuses) {
        if (statuses[i].reply == 'yes') {
          $("#participants").append('<li>' + statuses[i].participant + '</li>');
        }
      }
      var comments = result.comments;
      $("#comments").empty();
      for (var i in comments) {
        var date  = new Date(parseInt(comments[i].timestamp));
        var participant = toTwoDigits(date.getHours()) + ':' + toTwoDigits(date.getMinutes()) + ' ' + comments[i].participant;
        $("#comments").append('<li>' + participant + ': ' + comments[i].comment + '</li>');
      }
    },
    error: function(error) {
      // TODO Show error message
    }
  });
}

function confirmAttendance() {
  setStatus('yes');
}

function cancelAttendance() {
  setStatus('no');
}

function setStatus(reply) {
  var today = new Date();
  Parse.Cloud.run('setStatus', {
      clientId    : data.clientId,
      groupId     : data.groupId,
      participant : getDisplayName(),
      reply       : reply,
      timestamp   : getTimestamp(),
      timezone    : getTimezone()
    }, {
    success : function(result) {
      refreshEvent();
    },
    error : function(error) {
      // TODO Show error message
    }
  });
}

function addComment() {
  var comment = $('#comment').val();
  if (comment)
    Parse.Cloud.run('addComment', {
        clientId    : data.clientId,
        groupId     : data.groupId,
        participant : getDisplayName(),
        comment     : comment,
        timestamp   : getTimestamp(),
        timezone    : getTimezone()
      }, {
      success : function(result) {
        $("#comment").val('');
        refreshEvent();
      },
      error : function(error) {
        // TODO Show error message
      }
    });
}

function readQueryParameters() {
  data.groupCode = $.url().param('code');
  $('#display_name').val($.url().param('name'));
}

function enableOrDisableButtons() {
  var buttons = [$('#refresh'), $('#reply_yes'), $('#reply_no'), $('#add_comment')];
  for (var i in buttons) {
    if (data.groupCode)
      buttons[i].removeClass('ui-disabled');
    else
      buttons[i].addClass('ui-disabled');
  }
}

function activateFieldValidation() {
  var checkMaxLength = function(event) {
    var value = $(this).val();
    var maxLength = $(this).attr('maxlength');
    if (value.length > maxLength) { 
      $(this).val(value.substr(0, maxLength));
    }
  };
  var fields = [$('#display_name'), $('#comment')];
  for (var i in fields) {
    fields[i].keydown(checkMaxLength);
    fields[i].keyup(checkMaxLength);
  }
}

function bindActions() {
  $("#refresh").bind("click", refreshEvent);
  $("#reply_yes").bind("click", confirmAttendance);
  $("#reply_no").bind("click", cancelAttendance);
  $("#add_comment").bind("click", addComment);

  $("#comment").keypress(function(e) {
    if (e.keyCode == 13) {
      addComment();
      e.preventDefault();
    }
  });
}

function getDisplayName() {
  return $('#display_name').val();
}

function getTimestamp() {
  return new Date().getTime().toString();
}

function getTimezone() {
  return new Date().getTimezoneOffset().toString();
}

function toTwoDigits(intValue) {
  return intValue < 10 ? '0' + intValue : intValue;
}

$(document).ready(function() {
  registerClient();
  readQueryParameters();
  activateFieldValidation();
  enableOrDisableButtons();
  refreshGroup();
  bindActions();
});
