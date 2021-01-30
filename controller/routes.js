const dbConfig = require('./database');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const upload = require('express-fileupload');
const fs = require('fs');
const path = require('path');

const conn = mysql.createConnection(dbConfig.connection);
conn.connect();

setInterval(function () {
    conn.query('SELECT 1');
}, 4500);

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
        let photosArray = [];
        const user = req.user;

        conn.query("SELECT photo_id, name FROM photos WHERE user_id = ? ORDER BY created_at DESC", [user.user_id], (err, rows) => {
            if (err) {
                console.log(err);
            }

            let queryRows = JSON.parse(JSON.stringify(rows));
            queryRows.forEach(row => {
                photosArray.push(row);
            });

            res.render('main.ejs', {
                user: user,
                photos: photosArray
            });
        });
    });

    app.get('/edit', isLoggedIn, (req, res) => {
        const user = req.user;
        const userId = user.user_id;

        conn.query("SELECT * FROM users WHERE user_id = ?", [userId], (err, rows) => {
            if (err) {
                console.log(err);
            }
        });

        res.render('edit.ejs', {
            user: user
        });
    });

    app.post('/edit/:userId', (req, res) => {
        const user = req.user;
        const userId = req.user.user_id;
        const modifiedUsername = req.body.edit_username_input;
        
        if (req.files) {
            let file = req.files.change_picture;
            let filename = file.name;
            
            file.mv('static/profile_images/' + filename, (err) => {
                if (err) {
                    console.log(err);
                }
            });

            conn.query("UPDATE users SET profile_picture = ? WHERE user_id = ?", [filename, userId], (err, rows) => {
                if (err) {
                    console.log(err);
                } else {
                    return rows;
                }
            });

            user.profile_picture = filename;

            fs.readdir('static/profile_images', (err, files) => {
                if (err) {
                    console.log(err);
                }

                files.forEach(file => {
                    const fileDirectory = path.join('./static/profile_images/', file);

                    if (file !== filename) {
                        fs.unlinkSync(fileDirectory);
                    }
                });
            });
        }

        conn.query("SELECT * FROM users WHERE user_id = ?", [userId], (err, rows) => {
            if (err) {
                console.log(err);
            }

            conn.query("UPDATE users SET username = ? WHERE user_id = ?", [modifiedUsername, userId], (err, rows) => {
                if (err) {
                    console.log(err);
                } else {
                    return rows;
                }
            })
        });

        user.username = modifiedUsername;

        res.redirect('/main');
    });

    app.post('/uploadphoto', (req, res) => {
        const userId = req.user.user_id;

        if (req.files) {
            let file = req.files.added_photo;
            let filename = file.name;

            file.mv('static/uploaded_images/' + filename, (err) => {
                if (err) {
                    console.log(err);
                }
            });

            conn.query("INSERT INTO photos SET user_id = ?, name = ?", [userId, filename], (err, rows) => {
                if (err) {
                    console.log(err);
                } else {
                    return rows;
                }
            });

            res.redirect('/main');
        } else {
            res.redirect('/main');
        }
    });

    app.post('/deletePhoto/:photoId', isLoggedIn, (req, res) => {
        let user = req.user;
        let photoId = req.body.photoId;
        const deletePhoto = req.body.deleted_photo_name;

        fs.readdir('static/uploaded_images', (err, files) => {
            if (err) {
                console.log(err);
            }

            files.forEach(file => {
                const fileDirectory = path.join('./static/uploaded_images/', deletePhoto);

                if (file === deletePhoto) {
                    fs.unlinkSync(fileDirectory);
                }
            });
        });

        conn.query("SELECT photos.user_id, photo_id FROM photos JOIN users ON photos.user_id = users.user_id WHERE photos.user_id = ?", [user.user_id], (err, rows) => {
            if (err) {
                console.log(err);
            }

            conn.query("DELETE FROM photos WHERE photo_id = ?", [photoId], (err, rows) => {
                if (err) {
                    console.log(err);
                } else {
                    return rows;
                }
            });
        });

        res.redirect('/main');
    });

    app.post('/deleteAccount', (req, res) => {
        const user = req.user;

        req.logout();
        res.redirect('/');

        conn.query("DELETE FROM users WHERE user_id = ?", [user.user_id], (err, rows) => {
            if (err) {
                console.log(err);
            } else {
                return rows;
            }
        });
    })

    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();

        return res.redirect('/');
    }
}