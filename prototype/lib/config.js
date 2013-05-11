var express    = require('express'),
    path       = require('path'),
    url        = require('url'),
    redis      = require('redis'),
    RedisStore = require('connect-redis')(express);

exports.redisClient = (function() {
  var client = null;
  if (process.env.REDISCLOUD_URL) {
    var url = url.parse(process.env.REDISCLOUD_URL);
    client = redis.createClient(url.port, url.hostname, { no_ready_check : true });
    client.auth(url.auth.split(":")[1]);
  }
  else if (process.env.VCAP_SERVICES) {
    var services = JSON.parse(process.env.VCAP_SERVICES);
    var root; for(var key in services) root = key;
    var credentials = services[root][0].credentials;
    client = redis.createClient(credentials.port, credentials.host);
    if (credentials.password != '') client.auth(credentials.password);
  }
  else {
    client = redis.createClient();
  }
  return client;
})();

exports.app = (function() {
  var app = express();
  app.configure(function() {
    app.set('port', process.env.VCAP_APP_PORT || 3000);
    app.set('views', path.join(__dirname, '../views'));
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.methodOverride());
    app.use(express.static(path.join(__dirname, '../public')));
    app.use(express.session({
      store  : new RedisStore({ client : exports.redisClient }),
      secret : 'd41ly3v3nts'
    }));
    app.use(app.router);
  });
  return app;
})();
