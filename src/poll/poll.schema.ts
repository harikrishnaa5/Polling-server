import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class Option {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  option: string;
}
export const OptionSchema = SchemaFactory.createForClass(Option);

@Schema()
class VoteEntry {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  optionId: string;
}

export const VoteEntrySchema = SchemaFactory.createForClass(VoteEntry);

export type PollDocument = Poll & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class Poll {
  @Prop({ required: true })
  title: string;

  @Prop({ type: [OptionSchema], required: true })
  options: Option[];

  @Prop({ type: [String] })
  allowedUsers: string[];

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy: string;

  @Prop({ type: [VoteEntrySchema], default: [] })
  votes: VoteEntry[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 'public', enum: ['public', 'private'] })
  visibility: 'public' | 'private';

  @Prop({ type: Date })
  expiresAt: Date;
}

export const PollSchema = SchemaFactory.createForClass(Poll);
