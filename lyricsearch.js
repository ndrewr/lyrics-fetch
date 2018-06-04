// Music lyric search methods

const fetch = require('node-fetch');
const Spotify = require('spotify-web-api-node');
const qs = require('querystring');

// REQUIRED from external .env file (see pkg "dotenv")
const { MUSIXMATCH_KEY, SPOTIFY_ID, SPOTIFY_SEC } = process.env;

const mm_base_url = `http://api.musixmatch.com/ws/1.1/track.search?`;

const spotifyApi = new Spotify({
  clientId: SPOTIFY_ID,
  clientSecret: SPOTIFY_SEC
});

// Data model for music track search results
// First param indicates which service result is from
function Result(service, track, artist, album, cover, url, lyrics) {
  this.url = url || 'No Url';
  this.artist_name = artist || 'No Name';
  this.track_name = track || 'No Title';
  this.cover = cover || 'images/nocover_owl.png';
  this.lyrics_url = lyrics || '#';
  this.service = service || 'unaffiliated';
  this.album = album || 'No Album Title';
}

/**
 * Convenience wrapper for async request calls in a try-catch
 *
 * @param  {function} async_req
 *
 * @return {promise}
 */
async function handleRequest(async_req) {
  try {
    return await async_req();
  } catch (err) {
    console.error(`ruhroh: while calling ${async_req.name}...`, err);
    return null;
  }
}

/**
 * Aggregate search results from both services
 *
 * @param  {string} formatted_terms
 *
 * @return {object | null}
 */
async function searchAll(formatted_terms) {
  return formatted_terms
    ? {
        status: 'Success.',
        musixMatch: await musixSearch(formatted_terms),
        spotify: await spotifySearch(formatted_terms)
      }
    : null;
}

// TODO: I saw a number of repeat results so I run the response through a filter
/**
 * look for songs on spotify
 * uses https://github.com/thelinmichael/spotify-web-api-node
 *
 * @param  {string} formatted_terms
 *
 * @return {array | null}
 */
async function spotifySearch(formatted_terms) {
  // Retrieve an access token.
  const token = await handleRequest(
    spotifyApi.clientCredentialsGrant.bind(spotifyApi)
  );
  // console.log('The access token is ' + token.body['access_token']);

  let results = [];
  if (token) {
    // NOTE: formatted_terms get escaped by spotifyApi lib;
    // passing in pre-escaped query breaks search
    spotifyApi.setAccessToken(token.body['access_token']);
    const data = await handleRequest(
      spotifyApi.searchTracks.bind(spotifyApi, formatted_terms)
    );
    results = data.body.tracks.items;
    // get MusixMatch lyric link for spotify results
    results = await Promise.all(results.map(getMusixLyrics));
  }

  return processSpotifyResults(results);
}

/**
 * Format results from Spotify search
 *
 * @param  {array} results
 *
 * @return {array}
 */
function processSpotifyResults(results) {
  return results.map(track => {
    const track_name = track.name;
    const track_artist = track.artists[0].name;
    const track_cover = track.album.images[2]
      ? track.album.images[2].url
      : undefined;
    const track_url = track.preview_url;
    const track_album = track.album.name;
    const track_lyrics = track.lyrics_url;

    return new Result(
      'spotify',
      track_name,
      track_artist,
      track_album,
      track_cover,
      track_url,
      track_lyrics
    );
  });
}

// TODO: switch to npm pkg: https://github.com/c0b41/musixmatch
// addtl params: https://developer.musixmatch.com/documentation/input-parameters

/**
 * helper to access track list from MusixMatch api response
 *
 * @param  {object} data
 *
 * @return {array}
 */
function getMusixTrackList(data) {
  return data ? data.message.body.track_list.map(item => item.track) : [];
}

/**
 * Format results from MusixMatch search
 *
 * @param  {array} results
 *
 * @return {array}
 */
function processMusixResults(results) {
  // NOTE I currently don't query for spotify url
  // and stick undefined as placeholder
  return results.map(track => {
    var track_name = track.track_name;
    var track_artist = track.artist_name;
    var track_lyrics = track.track_share_url;
    var track_cover = track.album_coverart_100x100;
    var track_album = track.album_name;

    return new Result(
      'musix',
      track_name,
      track_artist,
      track_album,
      track_cover,
      undefined,
      track_lyrics
    );
  });
}

/**
 * look for specific song on musixmatch based on spotify track result
 *
 * @param  {object} track
 *
 * @return {object}
 */
async function getMusixLyrics(track) {
  const track_name = track.name;
  const track_artist = track.artists[0].name;
  const musix_query = `${mm_base_url}
	q_track=${qs.escape(track_name)}
	&q_artist=${qs.escape(track_artist)}
	&f_has_lyrics=1
	&apikey=${MUSIXMATCH_KEY}`.replace(/\s/g, '');
  let lyrics_url = '';

  if (track_name && track_artist) {
    const res = await handleRequest(fetch.bind(null, musix_query));
    const data = await handleRequest(res.json.bind(res));
    const tracks = getMusixTrackList(data);

    if (tracks.length) {
      lyrics_url = tracks[0].track_share_url;
    }
  }

  return {
    ...track,
    lyrics_url
  };
}

/**
 * look for songs on musixmatch
 *
 * @param  {string} formatted_terms
 *
 * @return {array | null}
 */
async function musixSearch(formatted_terms) {
  // insert params, remove newline chars
  const musix_query = `${mm_base_url}
	q_lyrics=${qs.escape(formatted_terms)}
	&f_has_lyrics=1
	&s_track_rating=DESC
	&f_lyrics_language=en
	&page_size=10
	&apikey=${MUSIXMATCH_KEY}`.replace(/\s/g, '');

  const res = await handleRequest(fetch.bind(null, musix_query));
  // const res = await fetch(musix_query);
  // console.log('mm: ', musix_query, res);
  const data = await handleRequest(res.json.bind(res));
  // const data = await res.json();
  // return getMusixTrackList(data);
  return processMusixResults(getMusixTrackList(data));
}

module.exports = {
  musixSearch,
  spotifySearch,
  searchAll
};
