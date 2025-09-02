import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { MusicsService } from './musics.service';
import { CreateMusicDto } from './dto/create-music.dto';
import { UpdateMusicDto } from './dto/update-music.dto';
import { FindMusicsDto } from './dto/find-musics.dto';
import { DeleteMusicsDto } from './dto/delete-musics.dto';
import type { Response } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import * as fs from 'fs';

@Controller('/admin/musics')
export class MusicsController {
  constructor(private readonly musicsService: MusicsService) {}

  @Get()
  async findAll(@Query() findMusicsDto: FindMusicsDto) {
    return this.musicsService.findAll(findMusicsDto);
  }

  @Get('categories')
  async getCategories() {
    return this.musicsService.getCategories();
  }
  @Post()
  create(@Body() createMusicDto: CreateMusicDto) {
    return this.musicsService.create(createMusicDto);
  }

  @Post('upload')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'audio', maxCount: 1 },
    { name: 'lyrics', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ], { storage: memoryStorage() }))
  async upload(
    @UploadedFiles() files: { audio?: Express.Multer.File[]; lyrics?: Express.Multer.File[]; cover?: Express.Multer.File[] }
  ) {
    return this.musicsService.saveUploadedFiles(files);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.musicsService.findOne(+id);
  }

  @Get(':id/cover')
  async getCover(@Param('id') id: string, @Res() res: Response) {
    const file = await this.musicsService.getCoverFile(+id);
    if (file.isUrl && file.url) {
      return res.redirect(file.url);
    }
    if (file.absPath && file.contentType) {
      res.setHeader('Content-Type', file.contentType);
      return fs.createReadStream(file.absPath).pipe(res);
    }
    return res.status(404).send('커버 이미지가 없습니다.');
  }

  @Get(':id/lyrics')
  async getLyrics(
    @Param('id') id: string,
    @Query('mode') mode: 'inline' | 'download' = 'inline',
    @Res() res: Response
  ) {
    const info = await this.musicsService.getLyricsFileInfo(+id);

    if (info.hasText && info.text) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      if (mode === 'download') {
        res.setHeader('Content-Disposition', `attachment; filename="lyrics.txt"`);
      }
      return res.send(info.text);
    }

    if (info.hasFile && info.absPath && info.filename) {
      res.setHeader('Content-Type', 'text/plain');
      if (mode === 'download') {
        res.setHeader('Content-Disposition', `attachment; filename="${info.filename}"`);
      }
      return fs.createReadStream(info.absPath).pipe(res);
    }

    return res.status(404).send('가사 파일을 찾을 수 없습니다.');
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMusicDto: UpdateMusicDto) {
    return this.musicsService.update(+id, updateMusicDto);
  }

  @Delete('delete')
  async delete(@Body() deleteDto: DeleteMusicsDto) {
    return this.musicsService.delete(deleteDto.ids);
  }
}
