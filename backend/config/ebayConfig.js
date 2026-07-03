const isProduction =
  process.env.EBAY_ENV === "production";

module.exports = {
  environment: process.env.EBAY_ENV,

  clientId: process.env.EBAY_CLIENT_ID,

  clientSecret:
    process.env.EBAY_CLIENT_SECRET,

  devId: process.env.EBAY_DEV_ID,

  redirectUri:
    process.env.EBAY_REDIRECT_URI,

  authUrl: isProduction
    ? "https://auth.ebay.com/oauth2/authorize"
    : "https://auth.sandbox.ebay.com/oauth2/authorize",

  tokenUrl: isProduction
    ? "https://api.ebay.com/identity/v1/oauth2/token"
    : "https://api.sandbox.ebay.com/identity/v1/oauth2/token",

  apiUrl: isProduction
    ? "https://api.ebay.com"
    : "https://api.sandbox.ebay.com",
};