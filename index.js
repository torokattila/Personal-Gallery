const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const PORT = (process.env.PORT || 3000);

const app = express();
const passport = require('passport');
const flash = require('connect-flash');

require('./controller/passport')(passport);

app.use(express.static(__dirname + '/static'));
app.use(express.static('controller'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('view engine', 'ejs');
app.use(fileUpload());
app.use(session({
    secret: 'justasecret',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./controller/routes')(app, passport);

app.listen(PORT, () => {
    console.log(`App is listening on PORT ${PORT}`);
});