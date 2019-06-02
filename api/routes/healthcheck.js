module.exports = (req, res) => {
  res.writeHead(301, {
    Location: process.env.BASE_URL
  })
  res.end()
}
