const { createProxyMiddleware } = require("http-proxy-middleware");

/**
 * CRA development proxy:
 * - Proxies /api/* to http://localhost:8000 by default
 * - Override target by setting BACKEND_PROXY_TARGET in environment if needed
 *
 * Note: Only used by `react-scripts start` in development.
 */
module.exports = function (app) {
  const target = process.env.BACKEND_PROXY_TARGET || "http://localhost:8000";
  app.use(
    "/api",
    createProxyMiddleware({
      target,
      changeOrigin: true,
      secure: false,
      xfwd: true,
      logLevel: "warn",
    })
  );
};
