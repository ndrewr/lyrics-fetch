// lyrix api micro-service
// NOTES:
// alias to domain: https://zeit.co/docs/features/aliases

require('dotenv').config()
const fetchLyrics = require('./lyricsearch')

module.exports = async (req, res) => {
    const results = await fetchLyrics.musixmatch()
    if (results.error) {
        console.log('There was a problem. Please try again.')
    } else {
        console.log('fetching....', results.track_list.length, results.track_list)
    }

    fetchLyrics.spotifySearch()

    return  'Hello world'
}

// const fetch = require('node-fetch');

// module.exports = async () => {
    // const request = await fetch('https://api.github.com/orgs/zeit/members')
    // const data = await request.json()
    // return data
// };
