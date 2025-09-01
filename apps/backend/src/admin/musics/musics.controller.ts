import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MusicsService } from './musics.service';
import { CreateMusicDto } from './dto/create-music.dto';
import { UpdateMusicDto } from './dto/update-music.dto';
import { FindMusicsDto } from './dto/find-musics.dto';

@Controller('/admin/musics')
export class MusicsController {
  constructor(private readonly musicsService: MusicsService) {}

  @Get()
  async findAll(@Query() findMusicsDto: FindMusicsDto) {
    return this.musicsService.findAll(findMusicsDto);
  }

  @Post()
  create(@Body() createMusicDto: CreateMusicDto) {
    return this.musicsService.create(createMusicDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.musicsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMusicDto: UpdateMusicDto) {
    return this.musicsService.update(+id, updateMusicDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.musicsService.remove(+id);
  }
}
