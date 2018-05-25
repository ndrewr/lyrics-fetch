// helper functions

const url = require('url');

function match(req, param) {
  const query = url.parse(req.url, true).query;
  return param ? query[param] : query;
}

module.exports = {
  match
};
