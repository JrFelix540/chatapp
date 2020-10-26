import { Migration } from '@mikro-orm/migrations';

export class Migration20201026104325 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("id" serial primary key, "username" varchar(255) not null, "email" varchar(255) not null, "created_at" timestamptz(0) not null, "password" varchar(255) not null, "updated_at" timestamptz(0) not null);');
    this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');

    this.addSql('create table "message" ("id" serial primary key, "content" varchar(255) not null, "sender_id" int4 not null, "receiver_id" int4 not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null);');
  }

}
