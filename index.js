// lyrix api micro-service
// NOTES:
// alias to domain: https://zeit.co/docs/features/aliases

require('dotenv').config();
const { send } = require('micro');
const fetchLyrics = require('./lyricsearch');
const { match } = require('./utils');

module.exports = async (req, res) => {
  // NOTE: remove below line when deploying
  if (req.url === '/favicon.ico') return 'NO favico for U!';

  var host = req.headers.host;

  console.log('incoming host...', host);

  // filter incoming request by domain
  const accepted_domains = ['localhost:3000', 'geomuze'];
  if (!accepted_domains.includes(host)) return 'Unknown.';

  const formatted_terms = match(req, 'q');

  return formatted_terms && typeof formatted_terms === 'string'
    ? send(res, 200, await fetchLyrics.searchAll(formatted_terms))
    : 'Bad query.';

  // return 'OK'
};
