// lyrix api micro-service
// NOTES:
// alias to domain: https://zeit.co/docs/features/aliases

require('dotenv').config()
const {buffer, text, json, send} = require('micro')
const fetchLyrics = require('./lyricsearch')
const {match} = require('./utils')

module.exports = async (req, res) => {
    // NOTE: remove below line when deploying
    if (req.url === '/favicon.ico') return 'NO favico for U!'

    // NOTE: in production this should be handled on client so remove
    // var formatted_terms = self.search_terms().replace( /\s|,/g ,"%20");

    var host = req.headers.host;
    // var origin = req.headers.origin; // undefined
    console.log('ncoming...', host, ' and connection: ', req.connection.remoteAddress)
    if (host !== 'localhost:3000') return 'Nope.'


    const formatted_terms = match(req, 'que')
    console.log('url: ', req.url, '...result: ', formatted_terms)

    if (formatted_terms) {
        // const all = await fetchLyrics.searchAll(formatted_terms)
        // send(res, 200, all)
    }
    else return 'Bad query.'

    return 'OK'
}
