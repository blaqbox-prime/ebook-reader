import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

class Achievements extends Model {
  static table = 'achievements';
  @field('slug') slug?: string;
  @field('title') title?: string;
  @field('unlocked_at') unlockedAt?: Date;
  @field('progress_value') progressValue?: number;
}

export default Achievements;
