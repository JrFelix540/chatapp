import { Migration } from '@mikro-orm/migrations';

export class Migration20201028115629 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "chat" ("id" serial primary key, "created_at" timestamptz(0) not null);');

    this.addSql('create table "user_chats" ("user_id" int4 not null, "chat_id" int4 not null);');
    this.addSql('alter table "user_chats" add constraint "user_chats_pkey" primary key ("user_id", "chat_id");');

    this.addSql('alter table "message" add column "chat_id" int4 null;');
    this.addSql('alter table "message" drop constraint if exists "message_receiver_id_check";');
    this.addSql('alter table "message" alter column "receiver_id" type int4 using ("receiver_id"::int4);');
    this.addSql('alter table "message" alter column "receiver_id" drop not null;');
    this.addSql('alter table "message" drop constraint if exists "message_sender_id_check";');
    this.addSql('alter table "message" alter column "sender_id" type int4 using ("sender_id"::int4);');
    this.addSql('alter table "message" alter column "sender_id" drop not null;');

    this.addSql('alter table "user_chats" add constraint "user_chats_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "user_chats" add constraint "user_chats_chat_id_foreign" foreign key ("chat_id") references "chat" ("id") on update cascade on delete cascade;');

    this.addSql('alter table "message" add constraint "message_chat_id_foreign" foreign key ("chat_id") references "chat" ("id") on update cascade on delete cascade;');
  }

}
