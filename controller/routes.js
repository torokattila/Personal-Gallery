const dbConfig = require('./database');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const conn = mysql.createConnection(dbConfig.connection);
conn.query('USE ' + dbConfig.database);

module.exports = (app, passport) => {

    app.get('/', (req, res) => {
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    app.post('/', passport.authenticate('local-login', {
        successRedirect: '/main',
        failureRedirect: '/',
        failureFlash: true
    }),
        (req, res) => {
            if (req.body.remember) {
                req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
                req.session.cookie.expires = false;
            }

            res.redirect('/main');
        });

    app.get('/signup', (req, res) => {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    app.post('/send', passport.authenticate('local-signup', {
        successRedirect: '/send',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    app.get('/send', (req, res) => {
        res.render('emailsend.ejs');
    });

    app.get('/verify', (req, res) => {
        host = req.get('host');

        if ((req.protocol + '://' + req.get('host')) == ('http://' + host)) {

            if (req.query.id == req.user.verify_id) {
                let verifyQuery = "UPDATE users SET is_verified = 'yes' WHERE verification_id = ? ";

                conn.query(verifyQuery, [req.user.verify_id], (err, rows) => {
                    if (err) {
                        console.log(err);
                    }
                });

                res.render('verifypage.ejs');
            } else {
                res.render('badrequest.ejs');
            }
        } else {
            res.render('unkonwnsource.ejs');
        }
    });

    app.get('/emailsenderror', (req, res) => {
        res.render('emailsenderror.ejs');
    })

    app.get('/main', isLoggedIn, (req, res) => {
        const user = req.user;

        conn.query("SELECT * FROM users WHERE user_id = ?", [user.user_id], (err, rows) => {
            if (err) {
                console.log(err);
            }
        });

        res.render('main.ejs', {
            user: user
        });
    });

    app.get('/edit', isLoggedIn, (req, res) => {
        res.render('edit.ejs');
    });

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();
        
        return res.redirect('/');
    }
}