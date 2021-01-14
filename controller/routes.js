const dbConfig = require('./database');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const conn = mysql.createConnection(dbConfig.connection);
conn.query('USE ' + dbConfig.database);

module.exports = (app, passport) => {

    app.get('/', (req, res) => {
        res.render('login.ejs');
    });

    app.get('/signup', (req, res) => {
        res.render('signup.ejs');
    });

    app.post('/send', passport.authenticate('local-signup', {
        successRedirect: '/send',
        failureRedirect: '/emailsenderror',
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
                res.end("<h1>Bad Request</h1>");
            }
        } else {
            res.end("<h1>Request is from unknown source!</h1>");
        }
    });
}