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
    ParseIntPipe,
} from '@nestjs/common';
import { HolidaysService } from './holidays.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { JwtAuthGuard, PermissionsGuard } from '../common/guards';
import { Permissions } from '../common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('holidays')
@Controller('holidays')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class HolidaysController {
    constructor(private readonly holidaysService: HolidaysService) { }

    @Post()
    @Permissions('holidays:create')
    @ApiOperation({ summary: 'Create a new holiday' })
    create(@Body() createHolidayDto: CreateHolidayDto) {
        return this.holidaysService.create(createHolidayDto);
    }

    @Get()
    @Permissions('holidays:read')
    @ApiOperation({ summary: 'Get all holidays' })
    findAll(@Query('year') year?: string) {
        return this.holidaysService.findAll(year ? parseInt(year) : undefined);
    }

    @Get(':id')
    @Permissions('holidays:read')
    @ApiOperation({ summary: 'Get a holiday by ID' })
    findOne(@Param('id') id: string) {
        return this.holidaysService.findOne(id);
    }

    @Patch(':id')
    @Permissions('holidays:update')
    @ApiOperation({ summary: 'Update a holiday' })
    update(@Param('id') id: string, @Body() updateHolidayDto: UpdateHolidayDto) {
        return this.holidaysService.update(id, updateHolidayDto);
    }

    @Delete(':id')
    @Permissions('holidays:delete')
    @ApiOperation({ summary: 'Delete a holiday' })
    remove(@Param('id') id: string) {
        return this.holidaysService.remove(id);
    }
}
