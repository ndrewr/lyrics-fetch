// helper functions

const url = require('url');

function match(req, param) {
  // const query = qs.parse(url.parse(req.url).query);
  const query = url.parse(req.url, true).query;
  //   console.log('matching...', query);
  return param ? query[param] : query;
}

module.exports = {
  match
};
