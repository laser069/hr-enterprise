-- AlterTable
ALTER TABLE "payroll_entries" ADD COLUMN     "additions" JSONB,
ADD COLUMN     "deductions" JSONB;
