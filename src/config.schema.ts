import joi from "joi";

export const configValidationSchema = joi.object({
  DATABASE_URL: joi.string().required(),
  FRONTEND_URL: joi.string().required(),
  JWT_ACCESS_SECRET: joi.string().required(),
  JWT_REFRESH_SECRET: joi.string().required(),
  PORT: joi.number().default(3000),
  STAGE: joi.string().required(),
  SENDGRID_API_KEY: joi.string().required(),
});
