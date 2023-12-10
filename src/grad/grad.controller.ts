import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GradService } from './grad.service';

@Controller('grad')
export class GradController {
  constructor(private readonly gradService: GradService) {}

  @Get('generate')
  findAll() {
    return this.gradService.generateSession();
  }
}
