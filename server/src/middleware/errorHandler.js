// middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error(err);

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({ error: 'Validation error', details: err.errors });
  }

  // Prisma unique constraint
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'A record with that value already exists.' });
  }

  // Prisma not found
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found.' });
  }

  res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
}

module.exports = { errorHandler };
