module.exports = (app) => {
    app.get('/', (req, res) => {
        res.render('login.ejs');
    });

    app.get('/signup', (req, res) => {
        res.render('signup.ejs');
    });
}