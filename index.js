// lyrix api micro-service
// NOTES:
// alias to domain: https://zeit.co/docs/features/aliases

require('dotenv').config();
const { buffer, text, json, send } = require('micro');
const fetchLyrics = require('./lyricsearch');
const { match } = require('./utils');

const qs = require('querystring');

module.exports = async (req, res) => {
  // NOTE: remove below line when deploying
  if (req.url === '/favicon.ico') return 'NO favico for U!';

  var host = req.headers.host;
  // var origin = req.headers.origin; // undefined
  console.log(
    'incoming...',
    host,
    ' and connection: ',
    req.connection.remoteAddress
  );
  if (host !== 'localhost:3000') return 'Nope.';

  const formatted_terms = match(req, 'q');
  console.log(
    'url: ',
    req.url,
    '...result: ',
    formatted_terms,
    qs.escape(formatted_terms)
  );

  if (formatted_terms && typeof formatted_terms === 'string') {
    const all = await fetchLyrics.searchAll(qs.escape(formatted_terms));
    send(res, 200, all);
  } else return 'Bad query.';

  // return 'OK'
};
