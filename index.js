const express = require('express')
const app = express();
const path = require('path');
const compression = require('compression');
const es6Renderer = require('express-es6-template-engine')
const PORT = process.env.PORT = 4000;

app.engine('html', es6Renderer);
app.set('views',path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(compression())
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.render('template.html');
})

app.get('/panel', (req, res) => {
    const panel = [...Array(3).keys()].map((v, i) => ({id: i, name: `item_${i}`, image: `images/phone.jpg`}))
    res.render('panel.html', {locals: {panel: panel}});
    setTimeout(() => {
    }, 1000);
})

app.get('/footer', (req, res) => {
    res.render('footer.html');
})

app.get('/footer-resources', (req, res) => {
    res.render('footer-resources.html');
})

app.listen(PORT, () => console.log(`App listening on http://localhost:${PORT}`))