import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { winstonConfig } from './config/winston.config';
import {
  HttpExceptionFilter,
  PrismaExceptionFilter,
} from './common/filters';
import {
  LoggingInterceptor,
  TransformInterceptor,
} from './common/interceptors';

async function bootstrap(): Promise<void> {
  const port = Number(process.env.PORT) || 3002;

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
  }));

  // Compression
  app.use(compression());

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
  });

  // Request logging middleware
  app.use((req: any, res: any, next: any) => {
    const logger = app.get('NestWinston');
    const { method, url, ip } = req;
    const userAgent = req.get('user-agent') || 'unknown';
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;
      const message = `${method} ${url} ${statusCode} - ${responseTime}ms - ${ip} - ${userAgent}`;
      
      if (statusCode >= 400) {
        logger?.error?.(message) || console.error(message);
      } else {
        logger?.log?.(message) || console.log(message);
      }
    });

    next();
  });

  // API Versioning (disabled for simplicity)
  // app.enableVersioning({
  //   type: VersioningType.URI,
  //   defaultVersion: '1',
  // });

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('HR Enterprise API')
    .setDescription('Production-ready Enterprise HR Management System')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication & Authorization')
    .addTag('Users', 'User Management')
    .addTag('Employees', 'Employee Management')
    .addTag('Departments', 'Department Management')
    .addTag('Attendance', 'Attendance Tracking')
    .addTag('Leave', 'Leave Management')
    .addTag('Payroll', 'Payroll Processing')
    .addTag('Performance', 'Performance Reviews')
    .addTag('Recruitment', 'Recruitment & ATS')
    .addTag('Compliance', 'Compliance & Filings')
    .addTag('Analytics', 'HR Analytics & Reports')
    .addTag('Workflow', 'Approval Workflows')
    .addTag('Files', 'File Uploads & Documents')
    .addTag('Notifications', 'Notifications & Real-time Updates')
    .addTag('Health', 'Health Checks')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new PrismaExceptionFilter(),
  );

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(port);

  console.log(`HR Enterprise API listening on http://localhost:${port}`);
  console.log(`Swagger Docs: http://localhost:${port}/api/docs`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}

void bootstrap();
