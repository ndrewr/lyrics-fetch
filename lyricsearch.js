// Music lyric search methods

const fetch = require('node-fetch');
const Spotify = require('spotify-web-api-node');

// REQUIRED from external .env file (see pkg "dotenv")
const {
	MUSIXMATCH_KEY,
	SPOTIFY_ID,
	SPOTIFY_SEC,
} = process.env

const mm_base_url = `http://api.musixmatch.com/ws/1.1/track.search?`

const spotifyApi = new Spotify({
	clientId: SPOTIFY_ID,
	clientSecret: SPOTIFY_SEC,
});


/**
 * Convenience wrapper for async reqeust calls in a try-catch
 * 
 * @param  {function} async_req
 * 
 * @return {promise}
 */
async function handleRequest (async_req) {
	try {
		return await async_req()
	} catch (err) {
		console.error(`ruhroh: while calling ${async_req.name}...`, err)
		return null
	}
}


/**
 * Aggregate search results from both services
 * 
 * @param  {string} formatted_terms
 * 
 * @return {object | null}
 */
async function searchAll (formatted_terms) {
	return formatted_terms ? 
		{
			musixMatch: await musixSearch(formatted_terms),
			spotify: await spotifySearch(formatted_terms),
		}
		: null
}


// NOTE I saw a number of repeat results so I
// run the response through a filter
/**
 * look for songs on spotify
 * 
 * @param  {string} formatted_terms
 * 
 * @return {array | null}
 */
async function spotifySearch (formatted_terms='chili') {
	// Retrieve an access token.
	const token = await handleRequest(spotifyApi.clientCredentialsGrant.bind(spotifyApi))
	// console.log('The access token is ' + token.body['access_token']);

	// Save the access token so that it's used in future calls
	let results = null
	if (token) {
		spotifyApi.setAccessToken(token.body['access_token']);
		const data = await handleRequest(spotifyApi.searchTracks.bind(spotifyApi, formatted_terms))
		results = data.body.tracks.items
	}

	return results
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

// npm pkg: https://github.com/c0b41/musixmatch
// addtl params: https://developer.musixmatch.com/documentation/input-parameters
/**
 * look for songs on musixmatch
 * 
 * @param  {string} formatted_terms
 * 
 * @return {array | null}
 */
async function musixSearch (formatted_terms='feel+good') {
	var musix_query = `${mm_base_url}
		q_lyrics=${formatted_terms}
		&f_has_lyrics=1
		&s_track_rating=DESC
		&f_lyrics_language=en
		&page_size=15
		&apikey=${MUSIXMATCH_KEY}`

	try {
		const res = await handleRequest(fetch.bind(null, musix_query))
		const data = await handleRequest(res.json.bind(res))		
		return data ? data.message.body.track_list : null
	} catch (err) {
		console.log('MusixSearch error...', err)
		return { error: true }
	}
}

// module.exports.musixmatch = musixSearch
// module.exports.spotifySearch = spotifySearch
// module.exports.searchAll = searchAll
module.exports = {
	musixSearch,
	spotifySearch,
	searchAll,
}
