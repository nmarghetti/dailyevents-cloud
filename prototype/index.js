var http   = require('http'),
    config = require('./lib/config'),
    api    = require('./lib/api');

var app = config.app;

app.get('/', api.index);
app.post('/api/groups', api.createGroup);
app.get('/api/groups/:group', api.getGroup);
app.post('/api/rsvp/:group', api.rsvp);
app.get('/api/participants/:group', api.getParticipants);
app.post('/api/comments/:group', api.addComment);
app.get('/api/comments/:group', api.getComments);

var server = http.createServer(app),
    port   = app.get('port');

http.createServer(app).listen(port, function() {
  console.log("Server listening on port " + port);
});
