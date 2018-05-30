// helper functions
// see https://github.com/zeit/micro/issues/16#issuecomment-206983402

const url = require('url');

function match(req, param) {
  const query = url.parse(req.url, true).query;
  return param ? query[param] : query;
}

module.exports = {
  match
};
