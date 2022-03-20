module.exports = {
  apps: [
    {
      name: "lb-b",
      script:
        "npm run db:migrate:prod && npm run db:generate && npm run build && npm run start:prod",
    },
  ],
};
