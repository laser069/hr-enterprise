import {
    Controller,
    Get,
    Query,
    UseGuards,
    Param,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @Get()
    @Permissions('audit:read')
    async findAll(
        @Query('skip') skip?: string,
        @Query('take') take?: string,
        @Query('userId') userId?: string,
        @Query('entity') entity?: string,
        @Query('action') action?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.auditService.findAll({
            skip: skip ? parseInt(skip, 10) : 0,
            take: take ? parseInt(take, 10) : 20,
            userId,
            entity,
            action,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });
    }

    @Get('entity/:entity')
    @Permissions('audit:read')
    async findByEntity(
        @Param('entity') entity: string,
        @Query('entityId') entityId?: string,
    ) {
        return this.auditService.findByEntity(entity, entityId);
    }
}
