export function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required.' });
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  return res.status(201).json({
    file: {
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: fileUrl,
    },
  });
}
