export default function authMiddleware(req, res, next) {
  req.user = { id: 10 }; // fake user for tests
  next();
}
