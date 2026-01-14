const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

const requireAuth = ClerkExpressRequireAuth({
  onError: (err, req, res) => {
    console.error("Auth Error:", err);
    res.status(401).json({ error: "Unauthenticated" });
  }
});

module.exports = { requireAuth };