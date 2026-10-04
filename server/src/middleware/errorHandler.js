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

  // Prisma foreign key violation — e.g. deleting a product still in order history
  if (err.code === 'P2003') {
    return res.status(409).json({
      error: 'That record is referenced by other data and cannot be changed.',
    });
  }

  // Multer upload errors (file type, size limit) are the client's fault, not ours
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'Image is too large (max 5MB).' : err.message });
  }

  // Thrown by our own upload fileFilter for non-image types
  if (typeof err.message === 'string' && err.message.startsWith('Only image files')) {
    return res.status(400).json({ error: err.message });
  }

  res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
}

module.exports = { errorHandler };
