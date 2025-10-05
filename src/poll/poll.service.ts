import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePollDto, PollVisiblity } from './dto/createPoll.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Poll, PollDocument } from './poll.schema';
import { Model } from 'mongoose';

@Injectable()
export class PollService {
  constructor(@InjectModel(Poll.name) private pollModel: Model<PollDocument>) {}
  async createPoll(
    createPollDto: CreatePollDto,
    userId: string,
  ): Promise<{ message: string }> {
    if (
      !Array.isArray(createPollDto.options) ||
      createPollDto.options.length < 2 ||
      createPollDto.options.length === 0 ||
      createPollDto.options.length > 4
    )
      throw new BadRequestException(
        'Options must contain between 2 and 4 items',
      );
    const now = new Date();
    const expiresAt = new Date(createPollDto.expiresAt);
    const maxExpiry = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    if (expiresAt > maxExpiry)
      throw new BadRequestException('Maximum Expiry time is 2 hours');
    if (
      createPollDto.visibility === PollVisiblity.PRIVATE &&
      (createPollDto.allowedUsers?.length === 0 || !createPollDto.allowedUsers)
    )
      throw new BadRequestException(
        'Private user must be provided for private polls',
      );
    const poll = new this.pollModel({
      title: createPollDto.title,
      options: createPollDto.options,
      createdBy: userId,
      visibility: createPollDto.visibility || PollVisiblity.PUBLIC,
      allowedUsers: createPollDto.allowedUsers || [],
      isActive: true,
      votes: [],
      expiresAt,
    });
    await poll.save();
    return { message: 'Poll saved successfull' };
  }

  async findAll(email: string, userRole: string): Promise<PollDocument[]> {
    let polls: PollDocument[] = [];
    if (userRole === 'admin') {
      // Return all polls for admin
      polls = await this.pollModel
        .find()
        .select('title createdAt isActive votes visibility options expiresAt')
        .exec();
    } else {
      polls = await this.pollModel
        .find({
          $or: [
            { visibility: 'public' },
            { visibility: 'private', allowedUsers: email },
          ],
        })
        .select('title createdAt isActive votes visibility options expiresAt')
        .exec();
    }
    return polls;
  }

  async deletePollById(id: string): Promise<{ message: string }> {
    const result = await this.pollModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException(`Poll with ID ${id} not found`);
    return { message: 'Poll deleted successfully' };
  }

  // async editPollById(id: string): Promise<{message: string}> {

  // }

  async castVote(
    pollId: string,
    email: string,
    option: { id: string; option: string },
  ): Promise<{ message: string }> {
    const poll = await this.pollModel.findById(pollId);
    if (!poll) throw new NotFoundException('Poll not found');

    if (!poll.isActive || poll.expiresAt <= new Date()) {
      throw new BadRequestException('Poll is expired or inactive');
    }

    if (poll.visibility === 'private' && !poll.allowedUsers.includes(email)) {
      throw new ForbiddenException(
        'Not authorized to vote on this private poll',
      );
    }

    const voteExists = poll?.votes?.some((vote) => vote.email === email);
    if (voteExists) {
      throw new BadRequestException('User has already voted');
    }

    const validOption = poll.options.find((opt) => opt.id === option.id);
    if (!validOption) {
      throw new BadRequestException('Invalid option selected');
    }
    poll.votes.push({ email, optionId: option.id });

    await poll.save();

    return { message: 'Vote cast successfully' };
  }
}
