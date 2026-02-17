import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3002),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  FRONTEND_URL: Joi.string().default('http://localhost:5173'),
  
  DATABASE_URL: Joi.string().required(),
  
  JWT_SECRET: Joi.string().min(32).required().messages({
    'string.min': 'JWT_SECRET must be at least 32 characters long',
  }),
  JWT_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required().messages({
    'string.min': 'JWT_REFRESH_SECRET must be at least 32 characters long',
  }),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
  
  BCRYPT_ROUNDS: Joi.number().default(12),
  RATE_LIMIT_TTL: Joi.number().default(60),
  RATE_LIMIT_MAX: Joi.number().default(100),
  
  APP_NAME: Joi.string().default('HR Enterprise'),
  APP_VERSION: Joi.string().default('1.0.0'),

  // Email configuration
  SMTP_HOST: Joi.string().default('smtp.gmail.com'),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASS: Joi.string().optional(),
  EMAIL_FROM: Joi.string().default('noreply@hrenterprise.com'),

  // Redis configuration
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional(),

  // AWS S3 configuration
  AWS_ACCESS_KEY_ID: Joi.string().optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional(),
  AWS_REGION: Joi.string().default('us-east-1'),
  AWS_S3_BUCKET: Joi.string().default('hr-enterprise-uploads'),

  // Sentry configuration
  SENTRY_DSN: Joi.string().optional(),
});
