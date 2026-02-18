import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { LeaveService } from './leave.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { ApproveLeaveDto } from './dto/approve-leave.dto';
import { JwtAuthGuard, PermissionsGuard } from '../common/guards';
import {
  Permissions,
  CurrentUser,
  CurrentUserPayload,
} from '../common/decorators';

@Controller('leave-requests')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LeaveRequestsController {
  constructor(private readonly leaveService: LeaveService) { }

  @Post()
  @Permissions('leave:create')
  create(
    @Body() createLeaveRequestDto: CreateLeaveRequestDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.employeeId) {
      throw new Error('User is not linked to an employee');
    }
    return this.leaveService.createLeaveRequest(
      user.employeeId,
      createLeaveRequestDto,
    );
  }

  @Get()
  @Permissions('leave:read')
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    return this.leaveService.findAllLeaveRequests(
      {
        skip,
        take,
        employeeId,
        status,
      },
      user,
    );
  }

  @Get('my-requests')
  @Permissions('leave:read')
  getMyRequests(
    @CurrentUser() user: CurrentUserPayload,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('status') status?: string,
  ) {
    if (!user.employeeId) {
      throw new Error('User is not linked to an employee');
    }
    return this.leaveService.findAllLeaveRequests({
      skip,
      take,
      employeeId: user.employeeId,
      status,
    });
  }

  @Get('balance')
  @Permissions('leave:read')
  getBalance(
    @CurrentUser() user: CurrentUserPayload,
    @Query('year', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe)
    year: number,
  ) {
    if (!user.employeeId) {
      throw new Error('User is not linked to an employee');
    }
    return this.leaveService.getLeaveBalance(user.employeeId, year);
  }

  @Get('summary')
  @Permissions('leave:read')
  getSummary(
    @CurrentUser() user: CurrentUserPayload,
    @Query('year', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe)
    year: number,
  ) {
    if (!user.employeeId) {
      throw new Error('User is not linked to an employee');
    }
    return this.leaveService.getLeaveSummary(user.employeeId, year);
  }

  @Get(':id')
  @Permissions('leave:read')
  findOne(@Param('id') id: string) {
    return this.leaveService.findLeaveRequestById(id);
  }

  @Patch(':id/approve')
  @Permissions('leave:approve')
  approve(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.employeeId) {
      throw new Error('User is not linked to an employee');
    }
    return this.leaveService.approveLeaveRequest(id, user.employeeId);
  }

  @Patch(':id/reject')
  @Permissions('leave:approve')
  reject(
    @Param('id') id: string,
    @Body() approveLeaveDto: ApproveLeaveDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.employeeId) {
      throw new Error('User is not linked to an employee');
    }
    return this.leaveService.approveLeaveRequest(
      id,
      user.employeeId,
      approveLeaveDto.rejectionReason,
    );
  }

  @Patch(':id/cancel')
  @Permissions('leave:create')
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.employeeId) {
      throw new Error('User is not linked to an employee');
    }
    return this.leaveService.cancelLeaveRequest(id, user.employeeId);
  }
}
