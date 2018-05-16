// helper functions

const qs = require('querystring');
const url = require('url');

function match(req, param) {
//   const query = qs.parse(url.parse(req.url).query);
    const query = url.parse(req.url, true).query;

    console.log('matching...', query)
    // console.log('parsed url: ', url.parse(req.url))
  
    return param ? query[param] : query
}

module.exports = {
    match,
}
