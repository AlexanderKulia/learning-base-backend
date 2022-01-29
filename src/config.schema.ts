import * as Joi from "@hapi/joi";

export const configValidationSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  FRONTEND_URL: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  PORT: Joi.number().default(3000),
  STAGE: Joi.string().required(),
});
