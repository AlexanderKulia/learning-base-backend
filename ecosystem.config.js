module.exports = {
  apps: [
    {
      name: "lb",
      script:
        "npm install && npm run db:migrate:prod && npm run build && npm run start:prod",
    },
  ],
};
