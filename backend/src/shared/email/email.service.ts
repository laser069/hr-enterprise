import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Password Reset Request',
        html: this.getPasswordResetTemplate(firstName, resetUrl),
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error);
      throw error;
    }
  }

  async sendEmailVerification(email: string, token: string, firstName: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const verifyUrl = `${frontendUrl}/auth/verify-email?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verify Your Email Address',
        html: this.getEmailVerificationTemplate(firstName, verifyUrl),
      });
      this.logger.log(`Email verification sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, firstName: string, temporaryPassword?: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to HR Enterprise!',
        html: this.getWelcomeTemplate(firstName, temporaryPassword),
      });
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}`, error);
      throw error;
    }
  }

  async sendLeaveApprovedEmail(
    email: string,
    firstName: string,
    leaveType: string,
    startDate: Date,
    endDate: Date,
    days: number,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Leave Request Approved',
        html: this.getLeaveApprovedTemplate(firstName, leaveType, startDate, endDate, days),
      });
      this.logger.log(`Leave approval email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send leave approval email to ${email}`, error);
      throw error;
    }
  }

  async sendLeaveRejectedEmail(
    email: string,
    firstName: string,
    leaveType: string,
    startDate: Date,
    endDate: Date,
    reason?: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Leave Request Update',
        html: this.getLeaveRejectedTemplate(firstName, leaveType, startDate, endDate, reason),
      });
      this.logger.log(`Leave rejection email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send leave rejection email to ${email}`, error);
      throw error;
    }
  }

  async sendPayrollProcessedEmail(
    email: string,
    firstName: string,
    month: string,
    year: number,
    netSalary: number,
    payslipUrl?: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `Payroll Processed - ${month} ${year}`,
        html: this.getPayrollTemplate(firstName, month, year, netSalary, payslipUrl),
      });
      this.logger.log(`Payroll email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send payroll email to ${email}`, error);
      throw error;
    }
  }

  async sendPerformanceReviewScheduledEmail(
    email: string,
    firstName: string,
    reviewPeriod: string,
    reviewDate: Date,
    reviewerName: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Performance Review Scheduled',
        html: this.getPerformanceReviewTemplate(firstName, reviewPeriod, reviewDate, reviewerName),
      });
      this.logger.log(`Performance review email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send performance review email to ${email}`, error);
      throw error;
    }
  }

  async sendAccountLockedEmail(email: string, firstName: string, unlockTime: Date): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Account Security Alert',
        html: this.getAccountLockedTemplate(firstName, unlockTime),
      });
      this.logger.log(`Account locked email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send account locked email to ${email}`, error);
      throw error;
    }
  }

  private getPasswordResetTemplate(firstName: string, resetUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hi ${firstName},</p>
        <p>We received a request to reset your password for your HR Enterprise account.</p>
        <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </div>
        <p>If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">This is an automated message from HR Enterprise. Please do not reply.</p>
      </div>
    `;
  }

  private getEmailVerificationTemplate(firstName: string, verifyUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to HR Enterprise!</h2>
        <p>Hi ${firstName},</p>
        <p>Thank you for registering with HR Enterprise. Please verify your email address to complete your registration.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #2196F3; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
        </div>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">This is an automated message from HR Enterprise.</p>
      </div>
    `;
  }

  private getWelcomeTemplate(firstName: string, temporaryPassword?: string): string {
    let passwordSection = '';
    if (temporaryPassword) {
      passwordSection = `
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Temporary Password:</strong> ${temporaryPassword}</p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Please change this password after your first login.</p>
        </div>
      `;
    }

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to HR Enterprise!</h2>
        <p>Hi ${firstName},</p>
        <p>Your account has been successfully created. You can now access all HR Enterprise features.</p>
        ${passwordSection}
        <p>If you have any questions, please contact your HR administrator.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">This is an automated message from HR Enterprise.</p>
      </div>
    `;
  }

  private getLeaveApprovedTemplate(
    firstName: string,
    leaveType: string,
    startDate: Date,
    endDate: Date,
    days: number,
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Leave Request Approved</h2>
        <p>Hi ${firstName},</p>
        <p>Your leave request has been <strong>approved</strong>.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Leave Type:</strong> ${leaveType}</p>
          <p style="margin: 5px 0;"><strong>Start Date:</strong> ${startDate.toDateString()}</p>
          <p style="margin: 5px 0;"><strong>End Date:</strong> ${endDate.toDateString()}</p>
          <p style="margin: 5px 0;"><strong>Duration:</strong> ${days} day(s)</p>
        </div>
        <p>Enjoy your time off!</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">This is an automated message from HR Enterprise.</p>
      </div>
    `;
  }

  private getLeaveRejectedTemplate(
    firstName: string,
    leaveType: string,
    startDate: Date,
    endDate: Date,
    reason?: string,
  ): string {
    const reasonSection = reason ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${reason}</p>` : '';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f44336;">Leave Request Update</h2>
        <p>Hi ${firstName},</p>
        <p>We regret to inform you that your leave request could not be approved at this time.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Leave Type:</strong> ${leaveType}</p>
          <p style="margin: 5px 0;"><strong>Start Date:</strong> ${startDate.toDateString()}</p>
          <p style="margin: 5px 0;"><strong>End Date:</strong> ${endDate.toDateString()}</p>
          ${reasonSection}
        </div>
        <p>If you have any questions, please contact your manager or HR department.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">This is an automated message from HR Enterprise.</p>
      </div>
    `;
  }

  private getPayrollTemplate(
    firstName: string,
    month: string,
    year: number,
    netSalary: number,
    payslipUrl?: string,
  ): string {
    const payslipSection = payslipUrl ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${payslipUrl}" style="background-color: #2196F3; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block;">View Payslip</a>
      </div>
    ` : '';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Payroll Processed</h2>
        <p>Hi ${firstName},</p>
        <p>Your payroll for <strong>${month} ${year}</strong> has been processed.</p>
        <div style="background-color: #e8f5e9; padding: 20px; border-radius: 4px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #666;">Net Salary</p>
          <p style="margin: 10px 0; font-size: 32px; font-weight: bold; color: #4CAF50;">$${netSalary.toLocaleString()}</p>
        </div>
        ${payslipSection}
        <p>If you have any questions about your payroll, please contact the finance department.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">This is an automated message from HR Enterprise.</p>
      </div>
    `;
  }

  private getPerformanceReviewTemplate(
    firstName: string,
    reviewPeriod: string,
    reviewDate: Date,
    reviewerName: string,
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Performance Review Scheduled</h2>
        <p>Hi ${firstName},</p>
        <p>A performance review has been scheduled for you.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Review Period:</strong> ${reviewPeriod}</p>
          <p style="margin: 5px 0;"><strong>Review Date:</strong> ${reviewDate.toDateString()}</p>
          <p style="margin: 5px 0;"><strong>Reviewer:</strong> ${reviewerName}</p>
        </div>
        <p>Please prepare for your review by completing your self-assessment in the HR portal.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">This is an automated message from HR Enterprise.</p>
      </div>
    `;
  }

  private getAccountLockedTemplate(firstName: string, unlockTime: Date): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f44336;">Account Security Alert</h2>
        <p>Hi ${firstName},</p>
        <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border: 1px solid #ffeaa7;">
          <p style="margin: 0;"><strong>Unlock Time:</strong> ${unlockTime.toLocaleString()}</p>
        </div>
        <p>If you didn't attempt to log in, please contact your system administrator immediately as this may indicate unauthorized access attempts.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">This is an automated security message from HR Enterprise.</p>
      </div>
    `;
  }
}
