var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var session = require("express-session");
var okta = require("@okta/okta-sdk-nodejs");
var ExpressOIDC = require("@okta/oidc-middleware").ExpressOIDC;
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const dashboardRouter = require("./routes/dashboard");         
const publicRouter = require("./routes/public");
const usersRouter = require("./routes/users");

var app = express();

var oktaClient = new okta.Client({
  orgUrl: 'https://dev-512294.okta.com',
  token: '00RQpIe9bObS_-hMnYXFrCxdUhOxyl2knYATLeDVym'
});
const oidc = new ExpressOIDC({
  issuer: "https://dev-512294.okta.com/oauth2/default",
  client_id: '0oa1al52rOIaf2JZT4x6',
  client_secret: 'QXh0NE3zKZXfi5ULvPlu8vI_ssHkxIP8nkCWqH83',
  redirect_uri: 'http://localhost:3000/users/callback',
  scope: "openid profile",
  routes: {
    login: {
      path: "/users/login"
    },
    callback: {
      path: "/users/callback",
      defaultRedirect: "/dashboard"
    }
  }
});

// view engine setup
app.engine('pug', require('pug').__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'kjhadfakjhfiuqerhfjkasdfkasjfasdfjkqhperqfhljksda',
  resave: true,
  saveUninitialized: false
}));
app.use(oidc.router);
app.use((req, res, next) => {
  if (!req.userinfo) {
    return next();
  }

  oktaClient.getUser(req.userinfo.sub)
    .then(user => {
      req.user = user;
      res.locals.user = user;
      next();
    }).catch(err => {
      next(err);
    });
});

app.use('/', publicRouter);
app.use('/about', publicRouter);
app.use('/contact', publicRouter);
app.use('/shop', publicRouter);
app.use('/dashboard', loginRequired, dashboardRouter);
app.use('/users', usersRouter);

function loginRequired(req, res, next) {
  if (!req.user) {
    return res.status(401).render("unauthenticated");
  }
  next();
}

// POST route from contact form
app.post('/contact', (req, res) => {
  console.log(req.body);
  // Instantiate the SMTP server
  const smtpTrans = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      //move these to .env to hide
      user: 'jshdevco@gmail.com',
      pass: 'PAssword21@!'
    }
  })

  // Specify what the email will look like
  const mailOpts = {
    from: 'Your sender info here', // This is ignored by Gmail
    to: 'jarshvader@gmail.com',
    subject: 'New message from contact form TEST',
    text: `${req.body.name} (${req.body.email}) says: ${req.body.message}`

  }

  // Attempt to send the email
  smtpTrans.sendMail(mailOpts, (error, response) => {
    if (error) {
      console.log('error');
      res.render('contact'); // Show a page indicating failure
    }
    else {
      console.log('pass');
      res.render('contact-success'); // Show a page indicating success
    }
  })
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
