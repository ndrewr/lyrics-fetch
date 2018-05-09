// lyrix api micro-service
// NOTES:
// alias to domain: https://zeit.co/docs/features/aliases

require('dotenv').config()
const fetch = require('node-fetch');

module.exports = async (req, res) => {

    return  'Hello world'
}


// const fetch = require('node-fetch');

// module.exports = async () => {
// 	const response = await fetch('https://api.example.com');
// 	const json = await response.json();
// 	return json;

    // const request = await fetch('https://api.github.com/orgs/zeit/members')
    // const data = await request.json()
    // return data
// };

// var SpotifyWebApi = require('spotify-web-api-node');

// // credentials are optional
// var spotifyApi = new SpotifyWebApi({
//   clientId: 'fcecfc72172e4cd267473117a17cbd4d',
//   clientSecret: 'a6338157c9bb5ac9c71924cb2940e1a7',
//   redirectUri: 'http://www.example.com/callback'
// });

// spotifyApi.setAccessToken('<your_access_token>'); // required?

// // Get Elvis' albums
// spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE').then(
//     function(data) {
//       console.log('Artist albums', data.body);
//     },
//     function(err) {
//       console.error(err);
//     }
//   );
