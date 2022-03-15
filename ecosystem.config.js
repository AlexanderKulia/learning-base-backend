module.exports = {
  apps: [
    {
      name: "lbb",
      script:
        "npm run db:migrate:prod && npm run db:generate && npm run build && npm run start:prod",
    },
  ],
};
