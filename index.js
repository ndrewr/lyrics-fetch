// lyrix api micro-service
// NOTES:
// alias to domain: https://zeit.co/docs/features/aliases

require('dotenv').config();
const { send } = require('micro');
const fetchLyrics = require('./lyricsearch');
const { match } = require('./utils');

module.exports = async (req, res) => {
  // CORS
  // TODO: address https://gist.github.com/balupton/3696140
  // possibly replace w/ https://github.com/possibilities/micro-cors
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  var incoming = req.headers.origin || req.headers.host;

  // filter incoming request by domain
  const dev = /^(https?:\/\/)?localhost:[0-9]+\/?$/;
  const prod = /^(https?:\/\/)?ndrewr.github.io(\/geomuze)?\/?$/;

  // const accepted_domains = ['ndrewr.github.io/geomuze'];
  // if (!accepted_domains.includes(incoming) && !dev.test(incoming)) {
  if (!prod.test(incoming) && !dev.test(incoming)) {
    return send(res, 400, { status: 'Error: Unknown origin.' });
  }

  const { com, q: formatted_terms } = match(req);

  // Handle a "warmup" request; Useful while this micro-service is hosted on a free service
  // that can be put to sleep.
  if (com === 'hi') {
    return '"One good thing about music, when it hits you, you feel no pain." - Bob Marley';
  }

  return formatted_terms && typeof formatted_terms === 'string'
    ? send(res, 200, await fetchLyrics.searchAll(formatted_terms))
    : send(res, 400, { status: 'Error: Bad query.' });
};
