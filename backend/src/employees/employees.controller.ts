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
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AssignManagerDto } from './dto/assign-manager.dto';
import { JwtAuthGuard, PermissionsGuard } from '../common/guards';
import { Permissions, CurrentUser } from '../common/decorators';

@Controller('employees')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) { }

  @Post()
  @Permissions('employees:create')
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @Permissions('employees:read')
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('departmentId') departmentId?: string,
    @Query('managerId') managerId?: string,
    @Query('employmentStatus') employmentStatus?: string,
    @Query('search') search?: string,
    @CurrentUser() user?: any,
  ) {
    return this.employeesService.findAll(
      {
        skip,
        take,
        departmentId,
        managerId,
        employmentStatus,
        search,
      },
      user,
    );
  }

  @Get('statistics')
  @Permissions('employees:read')
  getStatistics() {
    return this.employeesService.getStatistics();
  }

  @Get(':id')
  @Permissions('employees:read')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Get(':id/hierarchy')
  @Permissions('employees:read')
  getHierarchy(@Param('id') id: string) {
    return this.employeesService.getHierarchy(id);
  }

  @Get(':id/team')
  @Permissions('employees:read')
  getTeamMembers(@Param('id') id: string) {
    return this.employeesService.getTeamMembers(id);
  }

  @Patch(':id')
  @Permissions('employees:update')
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Patch(':id/manager')
  @Permissions('employees:update')
  assignManager(
    @Param('id') id: string,
    @Body() assignManagerDto: AssignManagerDto,
  ) {
    return this.employeesService.assignManager(id, assignManagerDto.managerId);
  }

  @Delete(':id')
  @Permissions('employees:delete')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}
