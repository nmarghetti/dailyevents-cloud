Parse.initialize(
  "OM6MTeOzj8Y5exBdXTCgCB97JqY1KaVOCFjEvcXJ", // App ID
  "fZeyTsabyz9phwCzXS52a5ABDrorWAleVbpYEIRb", // JavaScript key
  "hzuAv64exUWW6nOqQx0FYq53Kimbwe5T67rstWT6"  // Master key
);
Parse.serverURL = "https://parseapi.back4app.com";

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
  if (!data.groupCode) {
    showErrorMessage("No group parameter");
    disableElements([
      ui.fields.display_name,
      ui.fields.comment,
      ui.buttons.refresh,
      ui.buttons.reply_yes,
      ui.buttons.reply_no,
      ui.buttons.add_comment
    ]);
  }
  else {
    showLoadingMessage();
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
          disableElements([
            ui.buttons.refresh,
            ui.buttons.reply_yes,
            ui.buttons.reply_no,
            ui.buttons.add_comment
          ]);
          showErrorMessage("Unknown group");
        }
      },
      error : function(error) {
        hideLoadingMessage();
        showNetworkError();
      }
    });
  }
}

function refreshEvent() {
  if (!data.groupId) {
    refreshGroup();
  }
  else {
    var today = new Date();
    disableElements([ui.buttons.refresh]);
    showLoadingMessage('Refreshing event...');

    Parse.Cloud.run('getEvent', {
        groupId   : data.groupId,
        timestamp : today.getTime(),
        timezone  : today.getTimezoneOffset()
      }, {
      success : function(result) {
        refreshStatuses(result.statuses);
        refreshComments(result.comments);
        enableElements([ui.buttons.refresh]);
        hideLoadingMessage();
      },
      error : function(error) {
        hideLoadingMessage();
        showNetworkError();
        enableElements([ui.buttons.refresh]);
      }
    });
  }
}

function refreshStatuses(statuses) {
  var element = ui.labels.participants;
  element.empty();
  element.append($('<li/>', {
    'data-role' : 'list-divider',
    'text'      : 'Attending today'
  }));
  for (var i in statuses) {
    if (statuses[i].reply == 'yes')
      element.append($('<li/>', {
        'text' : statuses[i].participant
      }));
  }
  element.listview('refresh');
}

function refreshComments(comments) {
  var element = ui.labels.comments;
  element.empty();
  element.append($('<li/>', {
    'data-role' : 'list-divider',
    'text'      : 'Comments'
  }));
  for (var i in comments) {
    var date  = new Date(parseInt(comments[i].timestamp));
    var participant = toTwoDigits(date.getHours()) + ':' + toTwoDigits(date.getMinutes()) + ' ' + comments[i].participant;
    var item = $('<li/>', {
      'data-icon' : 'false',
      'html'      : participant + ': ' + linkify(comments[i].comment)
    });
    item.addClass('ui-li-static');
    element.append(item);
  }
  element.listview('refresh');
}

function linkify(text) {
  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return text.replace(exp, '<a href="$1">$1</a>'); 
}

function confirmAttendance() {
  setStatus('yes');
}

function cancelAttendance() {
  setStatus('no');
}

function setStatus(reply) {
  var displayName = getDisplayName();

  if (!data.groupId) {
    refreshGroup();
  }
  else if (!displayName) {
    showErrorMessage('Enter your display name');
  }
  else {
    disableElements([ui.buttons.reply_yes, ui.buttons.reply_no]);
    showLoadingMessage('Sending reply...')

    Parse.Cloud.run('setStatus', {
        groupId     : data.groupId,
        participant : getDisplayName(),
        reply       : reply,
        timestamp   : getTimestamp(),
        timezone    : getTimezone()
      }, {
      success : function(result) {
        hideLoadingMessage();
        refreshEvent();
        enableElements([ui.buttons.reply_yes, ui.buttons.reply_no]);
      },
      error : function(error) {
        hideLoadingMessage();
        showNetworkError();
        enableElements([ui.buttons.reply_yes, ui.buttons.reply_no]);
      }
    });
  }
}

function addComment() {
  var comment = getComment();
  var displayName = getDisplayName();

  if (!data.groupId) {
    refreshGroup();
  }
  else if (!displayName) {
      showErrorMessage('Enter your display name');
  }
  else if (!comment) {
    showErrorMessage('Enter your comment');
  }
  else {
    disableElements([ui.buttons.add_comment]);
    showLoadingMessage('Adding comment...');
    
    Parse.Cloud.run('addComment', {
        groupId     : data.groupId,
        participant : getDisplayName(),
        comment     : comment,
        timestamp   : getTimestamp(),
        timezone    : getTimezone()
      }, {
      success : function(result) {
        hideLoadingMessage();
        ui.fields.comment.val('');
        refreshEvent();
        enableElements([ui.buttons.add_comment]);
      },
      error : function(error) {
        hideLoadingMessage();
        showNetworkError();
        enableElements([ui.buttons.add_comment]);
      }
    });
  }
}

function readQueryParameters() {
  data.groupCode = $.url().param('code');
  ui.fields.display_name.val($.url().param('name'));
}

function enableElements(elements) {
  for (var i in elements) {
    elements[i].removeClass('ui-disabled');
  }
}

function disableElements(elements) {
  for (var i in elements) {
    elements[i].addClass('ui-disabled');
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
    enableElements(buttons);
  else
    disableElements(buttons);
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

function showLoadingMessage(message) {
  message = message || 'Loading...';
  $.mobile.loading("show", {theme: 'a', text: message, textVisible: true});
}

function hideLoadingMessage() {
  $.mobile.loading("hide");
}

function showNetworkError() {
  showErrorMessage('Network error');
}

function showErrorMessage(message) {
  $.mobile.loading("show", {theme: 'e', text: message, textVisible: true});
  setTimeout(hideLoadingMessage, 3000);
}

function getDisplayName() {
  return ui.fields.display_name.val().trim();
}

function getComment() {
  return ui.fields.comment.val().trim();
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
