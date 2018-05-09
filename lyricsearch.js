// look for songs on spotify
// NOTE I saw a number of repeat results so I
// run the response through a filter

const fetch = require('node-fetch');
const Spotify = require('spotify-web-api-node');
		
async function spotifySearch() {
	// // credentials are optional
	var spotifyApi = new Spotify({
	clientId: process.env.SPOTIFY_ID,
	clientSecret: process.env.SPOTIFY_SEC,
	//   redirectUri: 'http://localhost:3000/',
	});

	// spotifyApi.setAccessToken('<your_access_token>'); // required?

	// Retrieve an access token.
	// NOTE: should check for existing app token first?
	// If none, make the token request
	// If exists, immediately proceed with api request
	const token = await spotifyApi.getAccessToken()
	console.log('access token...', token)

	if (! token) {
		await spotifyApi.clientCredentialsGrant().then(
			function(data) {
				console.log('The access token expires in ' + data.body['expires_in']);
				console.log('The access token is ' + data.body['access_token']);
			
				// Save the access token so that it's used in future calls
				spotifyApi.setAccessToken(data.body['access_token']);
			},
			function(err) {
				console.log('Something went wrong when retrieving an access token', err);
			}
		);
	}

	// // Get Elvis' albums
	return spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE').then(
		function(data) {
		console.log('Artist albums', data.body);
		},
		function(err) {
		console.error('Spotify prob! ...', err);
		}
	);
}

/*
function spotifySearch(formatted_terms) {
	results_buffer = [];
	filter_list = []; // reset buffers
	var spotify_query = 'https://api.spotify.com/v1/search?q=' + formatted_terms + '&type=track&limit=10';

	$.getJSON(spotify_query, function(data) {
		var track_list = data.tracks.items; // an array
		track_list.forEach(function(track) {
			var track_name = track.name;
			var track_artist = track.artists[0].name;
			var track_cover = track.album.images[2]? track.album.images[2].url : undefined;
			var track_url = track.preview_url;
			var track_album = track.album.name;

			// check to see if this result already exists
			if(!filter_list.alreadyInArray(track_name, track_artist)) {
				// here I use filter_list as a temp holder
				// for same-track check...cuz the real array is
				// updated async!
				filter_list.push(new Result("spotify", track_name, track_artist));

				// fetch a lyrics url from musixmatch
				// using the title and name from spotify result
				// NOTE: must be a nested async call
				var track_lyrics;
				var musix_query = 'http://api.musixmatch.com/ws/1.1/track.search?q_track=' + track_name + '&q_artist=' + track_artist + '&format=JSONP' + '&f_has_lyrics=1&apikey=0bc726067d82f809bd3d1f7b5f0f7c2c';
				$.getJSON(musix_query+'&callback=?', function(data) {
					var fetch_result = data.message.body.track_list;
					// check response for track
					if (fetch_result.length > 0) {
						var track = fetch_result[0];
						track_lyrics = track.track.track_share_url;
					}
				})
				.always(function() {
					// push the results; track_url default undef
					results_buffer.push(new Result("spotify", track_name, track_artist, track_album, track_cover, track_url, track_lyrics));
				})
				.fail(function(e) {
					// on fail, alert home msg and push
					// result object w/o lyrics url
					self.message("Uh-oh! Problem fetching MusixMatch track...");
				});
			}
		});
	})
		.always(function() {
			// success or no, trigger a musixmatch search
			musixSearch(formatted_terms);
		})
		.fail(function(e) {
			// update home msg with status
			self.message("Aw man! Problem with Spotify!");
			app.informUser("Um. Spotify search error..try again?");
		});
}
*/

// look for songs on musixmatch
// https://developer.musixmatch.com/documentation/input-parameters
async function musixSearch(formatted_terms='feel+good') {
	const base_url = `http://api.musixmatch.com/ws/1.1/track.search?`
	var musix_query = `${base_url}
		q_lyrics=${formatted_terms}
		&f_has_lyrics=1
		&s_track_rating=DESC
		&f_lyrics_language=en
		&page_size=15
		&apikey=${process.env.MUSIXMATCH_KEY}`

	console.log('requesting... ')

	try {
		const res = await fetch(musix_query)
		const data = await res.json()
		console.log('data...', data)
		return data.message.body
	} catch (err) {
		console.log('ruhroh...', err)
		return { error: true }
	}
}

module.exports.musixmatch = musixSearch
module.exports.spotifySearch = spotifySearch
