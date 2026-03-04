import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import axios from 'axios';

@Injectable()
export class BankingService {
    private readonly logger = new Logger(BankingService.name);
    private readonly razorpayKeyId: string;
    private readonly razorpayKeySecret: string;
    private readonly baseUrl = 'https://api.razorpay.com/v1';

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {
        // Using provided keys from user for now, ideally these come from ConfigService/Env
        this.razorpayKeyId = this.configService.get<string>('RAZORPAY_KEY_ID') || 'rzp_test_RpeLGZo249pZ3k';
        this.razorpayKeySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET') || 'nfIyIRrUeAwo1hkC8OHAF2C3';
    }

    private get authHeader() {
        return {
            Authorization: `Basic ${Buffer.from(`${this.razorpayKeyId}:${this.razorpayKeySecret}`).toString('base64')}`,
        };
    }

    async getOrCreateContact(employeeId: string) {
        const employee: any = await this.prisma.employee.findUnique({
            where: { id: employeeId },
        });

        if (!employee) throw new BadRequestException('Employee not found');
        if (employee.razorpayContactId) return employee.razorpayContactId;

        try {
            const response = await axios.post(
                `${this.baseUrl}/contacts`,
                {
                    name: `${employee.firstName} ${employee.lastName}`,
                    email: employee.email,
                    contact: employee.phone || '9999999999', // Fallback for test
                    type: 'employee',
                    reference_id: employee.employeeCode,
                },
                { headers: this.authHeader },
            );

            const contactId = response.data.id;
            await (this.prisma.employee as any).update({
                where: { id: employeeId },
                data: { razorpayContactId: contactId },
            });

            return contactId;
        } catch (error: any) {
            this.logger.error(`Error creating Razorpay contact: ${error.response?.data?.error?.description || error.message}`);
            throw new BadRequestException('Failed to create bank contact');
        }
    }

    async getOrCreateFundAccount(employeeId: string) {
        const employee: any = await this.prisma.employee.findUnique({
            where: { id: employeeId },
        });

        if (!employee) throw new BadRequestException('Employee not found');
        if (employee.razorpayFundAccountId) return employee.razorpayFundAccountId;

        const contactId = await this.getOrCreateContact(employeeId);

        if (!employee.bankAccountNumber || !employee.ifscCode) {
            throw new BadRequestException(`Bank details missing for employee ${employee.employeeCode}`);
        }

        try {
            const response = await axios.post(
                `${this.baseUrl}/fund_accounts`,
                {
                    contact_id: contactId,
                    account_type: 'bank_account',
                    bank_account: {
                        name: `${employee.firstName} ${employee.lastName}`,
                        ifsc: employee.ifscCode,
                        account_number: employee.bankAccountNumber,
                    },
                },
                { headers: this.authHeader },
            );

            const fundAccountId = response.data.id;
            await (this.prisma.employee as any).update({
                where: { id: employeeId },
                data: { razorpayFundAccountId: fundAccountId },
            });

            return fundAccountId;
        } catch (error: any) {
            this.logger.error(`Error creating Razorpay fund account: ${error.response?.data?.error?.description || error.message}`);
            throw new BadRequestException('Failed to link bank account');
        }
    }

    async createPayout(payrollEntryId: string) {
        const entry: any = await this.prisma.payrollEntry.findUnique({
            where: { id: payrollEntryId },
            include: { employee: true },
        });

        if (!entry) throw new BadRequestException('Payroll entry not found');
        if (entry.razorpayPayoutId) return entry;

        const fundAccountId = await this.getOrCreateFundAccount(entry.employeeId);

        try {
            const response = await axios.post(
                `${this.baseUrl}/payouts`,
                {
                    account_number: '2323232323232323', // This should be the employer's RazorpayX account number
                    fund_account_id: fundAccountId,
                    amount: Math.round(Number(entry.netSalary) * 100), // Amount in paise
                    currency: 'INR',
                    mode: 'IMPS',
                    purpose: 'salary',
                    queue_if_low_balance: true,
                    reference_id: entry.id,
                    notes: {
                        payroll_run_id: entry.payrollRunId,
                    },
                },
                { headers: this.authHeader },
            );

            const updatedEntry = await (this.prisma.payrollEntry as any).update({
                where: { id: payrollEntryId },
                data: {
                    razorpayPayoutId: response.data.id,
                    payoutStatus: response.data.status,
                },
            });

            return updatedEntry;
        } catch (error: any) {
            this.logger.error(`Error creating Razorpay payout: ${error.response?.data?.error?.description || error.message}`);
            await (this.prisma.payrollEntry as any).update({
                where: { id: payrollEntryId },
                data: { payoutStatus: 'failed' },
            });
            throw new BadRequestException('Payout initiation failed');
        }
    }

    async verifyPayoutStatus(payoutId: string) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/payouts/${payoutId}`,
                { headers: this.authHeader },
            );

            await (this.prisma.payrollEntry as any).updateMany({
                where: { razorpayPayoutId: payoutId },
                data: { payoutStatus: response.data.status },
            });

            return response.data.status;
        } catch (error: any) {
            this.logger.error(`Error verifying payout status: ${error.message}`);
            return null;
        }
    }
}
