import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { EmailService } from './email.service';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        },
        defaults: {
          from: `"${process.env.APP_NAME || 'HR Enterprise'}" <${process.env.EMAIL_FROM || 'noreply@hrenterprise.com'}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: undefined, // Using inline HTML for simplicity
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
