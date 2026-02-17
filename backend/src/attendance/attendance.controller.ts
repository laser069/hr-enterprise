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
import { AttendanceService } from './attendance.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { JwtAuthGuard, PermissionsGuard } from '../common/guards';
import { Permissions, CurrentUser, CurrentUserPayload, Public } from '../common/decorators';

@Controller('attendance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) { }

  @Post('check-in')
  @Permissions('attendance:create')
  checkIn(@Body() checkInDto: CheckInDto) {
    return this.attendanceService.checkIn(checkInDto);
  }

  @Post('check-out')
  @Permissions('attendance:create')
  checkOut(@Body() checkOutDto: CheckOutDto) {
    return this.attendanceService.checkOut(checkOutDto);
  }

  @Post()
  @Permissions('attendance:create')
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get()
  @Permissions('attendance:read')
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('employeeId') employeeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    return this.attendanceService.findAll(
      {
        skip,
        take,
        employeeId,
        startDate,
        endDate,
        status,
      },
      user,
    );
  }

  @Get('today-stats')
  @Permissions('attendance:read')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async getTodayStats(@CurrentUser() user: CurrentUserPayload) {
    console.log(`User ${user?.userId} requesting today stats`);
    return this.attendanceService.getTodayStats();
  }

  @Get('my')
  @Permissions('attendance:read')
  getMyAttendance(
    @CurrentUser() user: CurrentUserPayload,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.getMyAttendance(user.userId, startDate, endDate);
  }

  @Get('summary/:employeeId')
  @Permissions('attendance:read')
  getSummary(
    @Param('employeeId') employeeId: string,
    @Query('month', new DefaultValuePipe(new Date().getMonth() + 1), ParseIntPipe)
    month: number,
    @Query('year', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe)
    year: number,
  ) {
    return this.attendanceService.getSummary(employeeId, month, year);
  }

  @Get(':id')
  @Permissions('attendance:read')
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }

  @Patch(':id')
  @Permissions('attendance:update')
  update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  @Permissions('attendance:delete')
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(id);
  }
}
