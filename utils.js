// helper functions
// see https://github.com/zeit/micro/issues/16#issuecomment-206983402

const url = require('url');

/**
 * Returns the request query params
 *
 * @param  {object} req
 * @param  {string} param
 *  *
 * @return {object | string}
 */
function match(req, param) {
  const query = url.parse(req.url, true).query;
  return param ? query[param] : query;
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

module.exports = {
  match,
  handleRequest
};
