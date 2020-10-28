import { Migration } from '@mikro-orm/migrations';

export class Migration20201028120719 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "message" drop constraint if exists "message_receiver_id_check";');
    this.addSql('alter table "message" alter column "receiver_id" type int4 using ("receiver_id"::int4);');
    this.addSql('alter table "message" drop constraint if exists "message_sender_id_check";');
    this.addSql('alter table "message" alter column "sender_id" type int4 using ("sender_id"::int4);');
  }

}
