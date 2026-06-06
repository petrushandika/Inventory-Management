module.exports = {
  apps: [
    {
      name: "inventory-management-server",
      script: "dist/index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3001,
      },
    },
  ],
};
