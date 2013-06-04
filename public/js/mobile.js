Parse.initialize(
  // Development
  // "uI57rIax4Tk31J5dI9EUKR3dCDhaeNphH2D0MmG1",
  // "E9GTKYZBjxPHuI0YIajAeKAtSeWZ4wzXJfysRq4g"
  
  // Production
  "Puuy52CoyWk3c5yOIubf3NPecyNdrNw7h4AAU7Qt",
  "inthUDhs4EiQT81QwnZbpMUe70PbJvzBn5wzYF5b"
);

var data = {};

var ui = {
  buttons : {
    refresh      : $('#refresh'),
    reply_yes    : $('#reply_yes'),
    reply_no     : $('#reply_no'),
    add_comment  : $('#add_comment')
  },
  fields : {
    display_name : $('#display_name'),
    comment      : $('#comment')
  },
  labels : {
    title        : $('#title'),
    participants : $('#participants'),
    comments     : $('#comments')
  }
};

function refreshGroup() {
  if (!data.groupCode) return; // code not provided
  
  Parse.Cloud.run('getGroupByCode', {
      code : data.groupCode
    }, {
    success : function(result) {
      if (result.id) {
        data.groupId   = result.id;
        data.groupName = result.name;
        ui.labels.title.text(data.groupName);
        document.title = data.groupName;
        refreshEvent();
      }
      else {
        data.groupCode = null;
        disableButtons([
          ui.buttons.refresh,
          ui.buttons.reply_yes,
          ui.buttons.reply_no,
          ui.buttons.add_comment
        ]);
      }
    },
    error : function(error) {
    }
  });
}

function refreshEvent() {
  if (!data.groupId) return; // group not fetched
  disableButtons([ui.buttons.refresh]);

  var today = new Date();
  Parse.Cloud.run('getEvent', {
      groupId   : data.groupId,
      timestamp : today.getTime(),
      timezone  : today.getTimezoneOffset()
    }, {
    success : function(result) {
      refreshStatuses(result.statuses);
      refreshComments(result.comments);
      enableButtons([ui.buttons.refresh]);
    },
    error: function(error) {
      enableButtons([ui.buttons.refresh]);
    }
  });
}

function refreshStatuses(statuses) {
  var element = ui.labels.participants;
  element.empty();
  element.append('<li data-role="list-divider">Attending today</li>');
  for (var i in statuses) {
    if (statuses[i].reply == 'yes') {
      element.append('<li>' + statuses[i].participant + '</li>');
    }
  }
  element.listview('refresh');
}

function refreshComments(comments) {
  var element = ui.labels.comments;
  element.empty();
  element.append('<li data-role="list-divider">Comments</li>');
  for (var i in comments) {
    var date  = new Date(parseInt(comments[i].timestamp));
    var participant = toTwoDigits(date.getHours()) + ':' + toTwoDigits(date.getMinutes()) + ' ' + comments[i].participant;
    element.append('<li>' + participant + ': ' + comments[i].comment + '</li>');
  }
  element.listview('refresh');
}

function confirmAttendance() {
  setStatus('yes');
}

function cancelAttendance() {
  setStatus('no');
}

function setStatus(reply) {
  if (!data.groupId) return; // group not fetched
  disableButtons([ui.buttons.reply_yes, ui.buttons.reply_no]);

  Parse.Cloud.run('setStatus', {
      groupId     : data.groupId,
      participant : getDisplayName(),
      reply       : reply,
      timestamp   : getTimestamp(),
      timezone    : getTimezone()
    }, {
    success : function(result) {
      refreshEvent();
      enableButtons([ui.buttons.reply_yes, ui.buttons.reply_no]);
    },
    error : function(error) {
      enableButtons([ui.buttons.reply_yes, ui.buttons.reply_no]);
    }
  });
}

function addComment() {
  var comment = ui.fields.comment.val().trim();
  if (!data.groupId || !comment) return; // group not fetched, or no comment to post
  disableButtons([ui.buttons.add_comment]);
  
  Parse.Cloud.run('addComment', {
      groupId     : data.groupId,
      participant : getDisplayName(),
      comment     : comment,
      timestamp   : getTimestamp(),
      timezone    : getTimezone()
    }, {
    success : function(result) {
      ui.fields.comment.val('');
      refreshEvent();
      enableButtons([ui.buttons.add_comment]);
    },
    error : function(error) {
      enableButtons([ui.buttons.add_comment]);
    }
  });
}

function readQueryParameters() {
  data.groupCode = $.url().param('code');
  ui.fields.display_name.val($.url().param('name'));
}

function enableButtons(buttons) {
  for (var i in buttons) {
    buttons[i].removeClass('ui-disabled');
  }
}

function disableButtons(buttons) {
  for (var i in buttons) {
    buttons[i].addClass('ui-disabled');
  }
}

function activateFieldValidation() {
  var fields = [
    ui.fields.display_name,
    ui.fields.comment
  ];
  for (var i in fields) {
    fields[i].keydown(checkMaxLength);
    fields[i].keyup(checkMaxLength);
  }
  fields[0].change(checkDisplayName);
  fields[0].keydown(checkDisplayName);
  fields[0].keyup(checkDisplayName);
}

function checkMaxLength() {
  var value = $(this).val();
  var maxLength = $(this).attr('maxlength');
  if (value.length > maxLength)
    $(this).val(value.substr(0, maxLength));
}

function checkDisplayName() {
  var buttons = [ui.buttons.reply_yes, ui.buttons.reply_no, ui.buttons.add_comment];
  if ($(this).val().trim())
    enableButtons(buttons);
  else
    disableButtons(buttons);
}

function bindActions() {
  ui.buttons.refresh.bind("click", refreshEvent);
  ui.buttons.reply_yes.bind("click", confirmAttendance);
  ui.buttons.reply_no.bind("click", cancelAttendance);
  ui.buttons.add_comment.bind("click", addComment);

  ui.fields.comment.keypress(function(e) {
    if (e.keyCode == 13) {
      addComment();
      e.preventDefault();
    }
  });
}

function getDisplayName() {
  return ui.fields.display_name.val();
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
  readQueryParameters();
  activateFieldValidation();
  bindActions();
  refreshGroup();
});
