const LocalStrategy = require('passport-local').Strategy;
const nodemailer = require('nodemailer');
const mysql = require('mysql');
const bcrypt = require('bcrypt-nodejs');
const dbConfig = require('./database');
const routes = require('./routes');
require('dotenv').config();

var smtpTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.NMEMAIL,
        pass: process.env.NMPASSWORD
    }
});

var conn;

function handleDisconnect() {
    conn = mysql.createConnection(dbConfig.connection);

    conn.connect(function (err) {
        if (err) {
            console.log('error when connecting to db: ', err);
            setTimeout(handleDisconnect, 10000);
        }
    });

    conn.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();

conn.query('USE ' + dbConfig.database);

conn.query("CREATE TABLE IF NOT EXISTS `users` ( " +
    "`user_id` int(6) NOT NULL AUTO_INCREMENT PRIMARY KEY, " +
    "`username` varchar(255) NOT NULL, " +
    "`password` varchar(255) NOT NULL, " +
    "`profile_picture` text NULL, " + 
    "`verification_id` varchar(100) NULL, " +
    "`is_verified` varchar(10) NULL DEFAULT 'no'" +
    ")");

conn.query("CREATE TABLE IF NOT EXISTS `photos` ( " +
    "`photo_id` int(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, " +
    "`user_id` int(6), " +
    "`name` TEXT, " +
    "`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
    ")");

module.exports = (passport, randomNumber) => {
    var randomNumber, mailOptions, host, link;

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((req, user, done) => {
        conn.query("SELECT * FROM users WHERE user_id = ? ", [user.user_id], (err, rows) => {
            if (err) {
                console.log(err);
                return done(null, err);
            }
            done(null, user);
        });
    });

    passport.use(
        'local-signup',
        new LocalStrategy({
            usernameField: 'signup_username',
            passwordField: 'signup_password',
            passReqToCallback: true
        },
            function (req, username, password, done) {
                conn.query("SELECT * FROM users WHERE username = ?", [username], function (err, rows) {
                    if (err)
                        return done(err);

                    if (rows.length) {
                        return done(null, false, req.flash('signupMessage', 'This username is already taken!'));
                    } else {
                        let userToMysql = {
                            username: username,
                            password: bcrypt.hashSync(password, null, null)
                        };

                        randomNumber = Math.floor((Math.random() * 1000000000000000) + 54);

                        host = req.get('host');
                        link = 'http://' + req.get('host') + '/verify?id=' + randomNumber;

                        mailOptions = {
                            to: req.body.signup_email,
                            subject: 'Confirm your Email address',
                            html: '<h3>Click the link down below to confirm your email address!</h3><br><a href="' + link + '">' + link + '</a>'
                        }

                        smtpTransport.sendMail(mailOptions, (error, response) => {
                            if (error) {
                                console.log(error);
                            }
                        })

                        let insertQuery = "INSERT INTO users (username, password, verification_id) values (?, ?, ?)";

                        conn.query(insertQuery, [userToMysql.username, userToMysql.password, randomNumber.toString()], (err, rows) => {
                            if (err) {
                                console.log(err);
                            } else {
                                userToMysql.user_id = rows.insertId;
                                userToMysql.verify_id = randomNumber;
                                return done(null, userToMysql);
                            }
                        });
                    }
                })
            }
        )
    );

    passport.use(
        'local-login',
        new LocalStrategy({
            usernameField: 'login-username',
            passwordField: 'login-password',
            passReqToCallback: true
        },
            function (req, username, password, done) {

                conn.query("SELECT * FROM users WHERE username = ?", [username], (err, rows) => {
                    if (err) {
                        return done(err);
                    }

                    if (!rows.length) {
                        return done(null, false, req.flash('loginMessage', 'There is no user with this username!'));
                    } else if (rows[0].is_verified == 'no') {
                        return done(null, false, req.flash('loginMessage', 'You have to verify your email address!'));
                    }

                    if (!bcrypt.compareSync(password, rows[0].password)) {
                        return done(null, false, req.flash('loginMessage', 'Wrong Password!'));
                    }

                    return done(null, rows[0]);
                });
            }
        )
    );
}