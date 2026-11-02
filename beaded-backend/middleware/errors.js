class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const GENERIC = 'Something went wrong. Please try again.';

function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

/* Logs where the failure happened, without the message, which can hold customer data. */
function logFailure(err, req) {
  const frames = (err.stack || '').split('\n').slice(1, 4).join('\n');
  console.error(`${req.method} ${req.path} failed: ${err.name}${err.code ? ` ${err.code}` : ''}\n${frames}`);
}

// Express identifies error handlers by their four arguments.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid request.' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'That request is too large.' });
  if (err.name === 'MulterError') return res.status(400).json({ error: 'Images must be JPG, PNG or WebP, under 5 MB.' });
  logFailure(err, req);
  return res.status(500).json({ error: GENERIC });
}

module.exports = { errorHandler, HttpError, notFound };
