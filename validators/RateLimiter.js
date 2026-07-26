const rateLimit = require('express-rate-limit')
const Responder = require('@service/ResponderService')


const localhostSkip = (req) => {
  const ip = req.get('x-forwarded-for') || req.socket?.remoteAddress || req.ip
  return ip === '::ffff:127.0.0.1' || ip === '127.0.0.1' || ip === '::1'
}

const authApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 12,
  handler: (req, res) => {
    return Responder.respondWithApiLimiter(req, res)
  },
  skip: localhostSkip
})

const otpApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 6,
  handler: (req, res) => {
    return Responder.respondWithApiLimiter(req, res)
  },
  skip: localhostSkip
})

const defaultApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  handler: (req, res) => {
    return Responder.respondWithApiLimiter(req, res)
  },
  skip: localhostSkip
})

module.exports = {
  authApiLimiter,
  defaultApiLimiter,
  otpApiLimiter
}
