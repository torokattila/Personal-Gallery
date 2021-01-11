const express = require('express');
const bodyParser = require('body-parser');
const PORT = (process.env.PORT || 3000);

const app = express();

app.use(express.static(__dirname + '/static'));
app.use(express.static('controller'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('view engine', 'ejs');

require('./controller/routes')(app);

app.listen(PORT, () => {
    console.log(`App is listening on PORT ${PORT}`);
});