const { withContentlayer } = require('next-contentlayer');

module.exports = withContentlayer({
  experimental: { images: { allowFutureImage: true } }
});
