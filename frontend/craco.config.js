const path = require(`path`);

module.exports = {
  eslint: {
    enable: false,
  },
  webpack: {
    alias: {
      "@configs": path.resolve(__dirname, "src/configs.json"),
    },
  },
};
