import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { UniversityService } from './university.service';

class UniversityDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

@Controller('universities')
export class UniversityController {
  constructor(private readonly service: UniversityService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Post()
  create(@Body() body: UniversityDto) { return this.service.create(body.name); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UniversityDto) { return this.service.update(id, body.name); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
