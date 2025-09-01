import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MusicsService } from './musics.service';
import { CreateMusicDto } from './dto/create-music.dto';
import { UpdateMusicDto } from './dto/update-music.dto';

@Controller('/admin/musics')
export class MusicsController {
  constructor(private readonly musicsService: MusicsService) {}

}
