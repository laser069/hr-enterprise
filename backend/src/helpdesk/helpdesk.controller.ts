import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { HelpdeskService } from './helpdesk.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('helpdesk')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HelpdeskController {
  constructor(private readonly helpdeskService: HelpdeskService) {}

  @Post('tickets')
  create(@Request() req: any, @Body() createTicketDto: CreateTicketDto) {
    return this.helpdeskService.create(req.user.userId, createTicketDto);
  }

  @Get('tickets')
  findAll(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('category') category?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    // If not admin/hr, only show own tickets
    // logic to allow admins to see all tickets or filter by assignedTo
    // For now, let's assume admins can see all, employees only theirs
    // This logic might need refinement based on Roles
    
    // We can rely on the service to filter if we pass the requesterId
    // But we need to know if the user is admin.
    // simpler approach:
    // If user has role 'admin' or 'hr', they can see all.
    // If user has role 'employee', enforce requesterId = req.user.userId
    
    // For MVP/Speed, let's just pass filters. 
    // Ideally we check req.user.role.
    
    // Let's assum user object has role info attached from JwtStrategy/Guard
    const isPrivileged = ['admin', 'hr'].includes(req.user.role?.name || '');
    const requesterId = isPrivileged ? undefined : req.user.userId;

    return this.helpdeskService.findAll({
      status,
      priority,
      category,
      requesterId, // limit to own tickets if not admin
      skip: skip ? parseInt(skip, 10) : 0,
      take: take ? parseInt(take, 10) : 10,
    });
  }

  @Get('tickets/:id')
  findOne(@Param('id') id: string) {
    return this.helpdeskService.findOne(id);
  }

  @Patch('tickets/:id')
  updateStatus(
    @Param('id') id: string,
    @Body() updateTicketStatusDto: UpdateTicketStatusDto,
  ) {
    return this.helpdeskService.updateStatus(id, updateTicketStatusDto);
  }

  @Post('tickets/:id/comments')
  addComment(
    @Request() req: any,
    @Param('id') id: string,
    @Body() addCommentDto: AddCommentDto,
  ) {
    // TODO: Verify user has access to this ticket
    return this.helpdeskService.addComment(id, req.user.userId, addCommentDto);
  }

  @Get('stats')
  @Roles('admin', 'hr')
  getStats() {
    return this.helpdeskService.getStats();
  }
}
