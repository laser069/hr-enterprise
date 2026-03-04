import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateGoalDto } from './dto/create-goal.dto';
import { CreatePerformanceReviewDto } from './dto/create-performance-review.dto';

@Controller('performance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) { }

  // ============ Goal Endpoints ============

  @Post('goals')
  @Roles('admin', 'hr', 'manager')
  async createGoal(@Body() createDto: CreateGoalDto) {
    return this.performanceService.createGoal(createDto);
  }

  @Get('goals')
  async findAllGoals(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.performanceService.findAllGoals({
      employeeId,
      status,
      skip: skip ? parseInt(skip, 10) : 0,
      take: take ? parseInt(take, 10) : 20,
    });
  }

  @Get('goals/:id')
  async findGoalById(@Param('id') id: string) {
    return this.performanceService.findGoalById(id);
  }

  @Patch('goals/:id/progress')
  @Roles('admin', 'hr', 'manager')
  async updateGoalProgress(
    @Param('id') id: string,
    @Body('achievedValue') achievedValue: number,
  ) {
    return this.performanceService.updateGoalProgress(id, achievedValue);
  }

  @Patch('goals/:id/status')
  @Roles('admin', 'hr')
  async updateGoalStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.performanceService.updateGoalStatus(id, status);
  }

  @Delete('goals/:id')
  @Roles('admin', 'hr')
  async deleteGoal(@Param('id') id: string) {
    return this.performanceService.deleteGoal(id);
  }

  // ============ Performance Review Endpoints ============

  @Post('reviews')
  @Roles('admin', 'hr', 'manager')
  async createPerformanceReview(@Body() createDto: CreatePerformanceReviewDto) {
    return this.performanceService.createPerformanceReview(createDto);
  }

  @Get('reviews')
  async findAllPerformanceReviews(
    @Query('employeeId') employeeId?: string,
    @Query('reviewerId') reviewerId?: string,
    @Query('status') status?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.performanceService.findAllPerformanceReviews({
      employeeId,
      reviewerId,
      status,
      skip: skip ? parseInt(skip, 10) : 0,
      take: take ? parseInt(take, 10) : 20,
    });
  }

  @Get('reviews/:id')
  async findPerformanceReviewById(@Param('id') id: string) {
    return this.performanceService.findPerformanceReviewById(id);
  }

  @Post('reviews/:id/submit')
  @Roles('admin', 'hr', 'manager')
  async submitPerformanceReview(@Param('id') id: string) {
    return this.performanceService.submitPerformanceReview(id);
  }

  @Post('reviews/:id/acknowledge')
  async acknowledgePerformanceReview(@Param('id') id: string) {
    return this.performanceService.acknowledgePerformanceReview(id);
  }

  // ============ Summary Endpoints ============

  @Get('summary/:employeeId')
  async getEmployeePerformanceSummary(@Param('employeeId') employeeId: string) {
    return this.performanceService.getEmployeePerformanceSummary(employeeId);
  }

  // ============ 360 Feedback Endpoints ============

  @Post('feedback')
  async createFeedbackRequest(@Body() createDto: any) {
    return this.performanceService.createFeedbackRequest(createDto);
  }

  @Post('feedback/:id/submit')
  async submitFeedback(@Param('id') id: string, @Body() submitDto: any) {
    return this.performanceService.submitFeedback(id, submitDto);
  }

  @Get('feedback')
  async findAllFeedback(
    @Query('employeeId') employeeId?: string,
    @Query('reviewerId') reviewerId?: string,
  ) {
    return this.performanceService.findAllFeedback({ employeeId, reviewerId });
  }

  // ============ Promotion & Increment Endpoints ============

  @Post('promotions')
  @Roles('admin', 'hr')
  async createPromotion(@Body() createDto: any) {
    return this.performanceService.createPromotion(createDto);
  }

  @Get('promotions/:employeeId')
  async findAllPromotions(@Param('employeeId') employeeId: string) {
    return this.performanceService.findAllPromotions(employeeId);
  }
}
