import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { JwtAuthGuard, PermissionsGuard } from '../common/guards';
import { Permissions } from '../common/decorators';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('shifts')
@Controller('shifts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ShiftsController {
    constructor(private readonly shiftsService: ShiftsService) { }

    @Post()
    @Permissions('shifts:create') // Ensure permission exists or create it
    @ApiOperation({ summary: 'Create a new shift' })
    create(@Body() createShiftDto: CreateShiftDto) {
        return this.shiftsService.create(createShiftDto);
    }

    @Get()
    @Permissions('shifts:read')
    @ApiOperation({ summary: 'Get all shifts' })
    findAll(@Query('isActive') isActive?: string) {
        const active = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        return this.shiftsService.findAll({ isActive: active });
    }

    @Get(':id')
    @Permissions('shifts:read')
    @ApiOperation({ summary: 'Get a shift by ID' })
    findOne(@Param('id') id: string) {
        return this.shiftsService.findOne(id);
    }

    @Patch(':id')
    @Permissions('shifts:update')
    @ApiOperation({ summary: 'Update a shift' })
    update(@Param('id') id: string, @Body() updateShiftDto: UpdateShiftDto) {
        return this.shiftsService.update(id, updateShiftDto);
    }

    @Delete(':id')
    @Permissions('shifts:delete')
    @ApiOperation({ summary: 'Delete a shift' })
    remove(@Param('id') id: string) {
        return this.shiftsService.remove(id);
    }
}
