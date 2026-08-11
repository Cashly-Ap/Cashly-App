const PROXY_CONFIG = {
  "/api": {
    target: "http://parsun-api-app:8080",
    secure: false,
    changeOrigin: true,
    configure: (proxy, options) => {
      proxy.on('proxyReq', (proxyReq, req, res) => {
        const contentType = req.headers['content-type'];
        if (contentType && contentType.includes('multipart/form-data')) {
          const cleanContentType = contentType.replace(/;?\s*charset=[^;]*/gi, '');
          proxyReq.setHeader('Content-Type', cleanContentType);
        }
      });
    }
  },
  "/ws": {
    target: "ws://parsun-api-app:8080",
    ws: true,
    secure: false,
    changeOrigin: true,
  }
};

module.exports = PROXY_CONFIG;
