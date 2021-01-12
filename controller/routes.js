const nodemailer = require('nodemailer');

var smtpTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'personalgallery12@gmail.com',
        pass: 'mypersonalgallery1'
    }
});

var randomNumber, mailOptions, host, link;

module.exports = (app) => {
    app.get('/', (req, res) => {
        res.render('login.ejs');
    });

    app.get('/signup', (req, res) => {
        res.render('signup.ejs');
    });

    app.post('/send', (req, res) => {
        randomNumber = Math.floor((Math.random() * 1000000000) + 54);
        host = req.get('host');
        link = 'http://' + req.get('host') + '/verify?id=' + randomNumber;

        mailOptions = {
            to: req.body.signup_email,
            subject: 'Confirm your Email address',
            html: '<h3>Click the link down below to confirm your email address!</h3><br><a href="' + link + '">' + link + '</a>'
        }

        smtpTransport.sendMail(mailOptions, (error, response) => {
            if (error) {
                res.render('emailsenderror.ejs');
            } else {
                res.render('emailsend.ejs');
            }
        })
    });

    app.get('/verify', (req, res) => {
        // console.log(req.protocol + ':/' + req.get('host'));

        if ((req.protocol + '://' + req.get('host')) == ('http://' + host)) {

            if (req.query.id == randomNumber) {

                res.render('verifypage.ejs');
            } else {
                res.end("<h1>Bad Request</h1>");
            }
        } else {
            res.end("<h1>Request is from unknown source!</h1>");
        }
    });
}