import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { CreatePollDto } from './dto/createPoll.dto';
import { PollService } from './poll.service';

@Controller('poll')

//create poll - only admin
//update pole by id - only admin
//delete poll - only admin
//get all polls
export class PollController {
  constructor(private readonly pollService: PollService) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('create')
  createPoll(@Body() createPollDto: CreatePollDto, @Request() req) {
    const userId = req.user.userId;
    return this.pollService.createPoll(createPollDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getPolls(@Request() req) {
    const email = req.user.email;
    const role = req.user.role;
    return this.pollService.findAll(email, role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.pollService.deletePollById(id);
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  // @Put(':id')
  // edit(@Param('id') id: string) {
  //   return this.pollService.editPollById(id);
  // }

  @UseGuards(JwtAuthGuard)
  @Post('vote')
  async vote(@Body() voteDto: { pollId: string; option: { id: string; option: string } }, @Request() req) {
    const email = req.user.email;
    return this.pollService.castVote(voteDto.pollId, email, voteDto.option);
  }
}
