require('dotenv').config()
const Immutable = require('immutable');
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls
app.get('/rover/:name', async (req, res) => {
    try {
        const fetchURI = `https://api.nasa.gov/mars-photos/api/v1/manifests/${req.params.name}/?api_key=${process.env.API_KEY}`
        console.log('fetchURI: ', fetchURI)
        await fetch(fetchURI)
            .then(res => res.json())
            .then(data => res.send(Immutable.Map(data.photo_manifest)));
    } catch (err) {
        console.log('error: ', err);
    }
});

app.get('/rover/:name/:date', async (req, res) => {
    try {
        const uri = `https://api.nasa.gov/mars-photos/api/v1/rovers/${req.params.name}/photos?earth_date=${req.params.date}&api_key=${process.env.API_KEY}`
        console.log(uri)
        await fetch(uri)
            .then(res => res.json())
            .then(data => res.send(Immutable.List(data.photos)));
    } catch (err) {
        console.log('error: ', err);
    }
});

app.listen(port, () => console.log(`Mar Rover Dashboard app listening on port ${port}!`))