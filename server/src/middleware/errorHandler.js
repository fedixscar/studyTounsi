const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Cette ressource existe déjà' });
  }
  
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Ressource introuvable' });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Erreur interne du serveur'
  });
};

module.exports = { errorHandler };
