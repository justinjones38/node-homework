function notFound(req, res) {
  return res.status(404).json({
    message: "Sorry, your content is not found"
  })
}

module.exports = {notFound}