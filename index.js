// lyrix api micro-service
// NOTES:
// alias to domain: https://zeit.co/docs/features/aliases

require('dotenv').config()
const {buffer, text, json, send} = require('micro')
const fetchLyrics = require('./lyricsearch')

module.exports = async (req, res) => {

    console.log('checking musicmatch...')
    const results = await fetchLyrics.musixmatch()
    if (results.error) {
        console.log('There was a problem with MusixMatch. Please try again.')
    } else {
        console.log('fetching...api returned...', results.track_list.length)
    }

    console.log('checking spotify...')    
    const spotify_results = await fetchLyrics.spotifySearch()
    if (spotify_results) {
        console.log('fething...api returned...', spotify_results.href)
    } else {
        console.log('There was a problem with Spotify. Please try again.')
    }

    // return  'Done'
    // send(res, 200, results)
    send(res, 200, {
        musix: results.track_list,
        spotify: spotify_results.items,
    })    
}

// const fetch = require('node-fetch');

// module.exports = async () => {
    // const request = await fetch('https://api.github.com/orgs/zeit/members')
    // const data = await request.json()
    // return data
// };
