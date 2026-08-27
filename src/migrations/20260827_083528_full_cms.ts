import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'
import { generateNKeysBetween } from 'payload/shared'

/**
 * Carries the old numeric `order` over to Payload's fractional `_order` keys, so an existing
 * database keeps the order its editor dragged into place instead of losing it with the column.
 */
async function carryOrderOver(db: MigrateUpArgs['db'], table: 'works' | 'posts'): Promise<void> {
  const name = sql.identifier(table)
  const rows = await db.all<{ id: number }>(sql`SELECT id FROM ${name} ORDER BY "order" ASC`)
  if (!rows.length) return
  const keys = generateNKeysBetween(null, null, rows.length)
  for (const [i, row] of rows.entries()) {
    await db.run(sql`UPDATE ${name} SET _order = ${keys[i]} WHERE id = ${row.id}`)
  }
}

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`services_tags\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`services_tags_order_idx\` ON \`services_tags\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`services_tags_parent_id_idx\` ON \`services_tags\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`services\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`title\` text NOT NULL,
  	\`text\` text,
  	\`image_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`services__order_idx\` ON \`services\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`services_image_idx\` ON \`services\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`services_updated_at_idx\` ON \`services\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`services_created_at_idx\` ON \`services\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`testimonials\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`quote\` text NOT NULL,
  	\`name\` text NOT NULL,
  	\`role\` text,
  	\`avatar_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`testimonials__order_idx\` ON \`testimonials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`testimonials_avatar_idx\` ON \`testimonials\` (\`avatar_id\`);`)
  await db.run(sql`CREATE INDEX \`testimonials_updated_at_idx\` ON \`testimonials\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`testimonials_created_at_idx\` ON \`testimonials\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`clients\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`name\` text NOT NULL,
  	\`year\` text,
  	\`image_id\` integer,
  	\`href\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`clients__order_idx\` ON \`clients\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`clients_image_idx\` ON \`clients\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`clients_updated_at_idx\` ON \`clients\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`clients_created_at_idx\` ON \`clients\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`awards\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`name\` text NOT NULL,
  	\`text\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`awards__order_idx\` ON \`awards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`awards_updated_at_idx\` ON \`awards\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`awards_created_at_idx\` ON \`awards\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`faqs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`question\` text NOT NULL,
  	\`answer\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`faqs__order_idx\` ON \`faqs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`faqs_updated_at_idx\` ON \`faqs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`faqs_created_at_idx\` ON \`faqs\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`home_hero_bio\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`value\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_hero_bio_order_idx\` ON \`home_hero_bio\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_hero_bio_parent_id_idx\` ON \`home_hero_bio\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_about_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_about_paragraphs_order_idx\` ON \`home_about_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_about_paragraphs_parent_id_idx\` ON \`home_about_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_about_metrics\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`end\` numeric NOT NULL,
  	\`suffix\` text,
  	\`label\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_about_metrics_order_idx\` ON \`home_about_metrics\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_about_metrics_parent_id_idx\` ON \`home_about_metrics\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_approach_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_approach_steps_order_idx\` ON \`home_approach_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_approach_steps_parent_id_idx\` ON \`home_approach_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_contact_fields\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`name\` text NOT NULL,
  	\`placeholder\` text,
  	\`type\` text DEFAULT 'text',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_contact_fields_order_idx\` ON \`home_contact_fields\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_contact_fields_parent_id_idx\` ON \`home_contact_fields\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_intro\` text DEFAULT 'I create digital experiences that feel** effortless to use and powerful in impact—FRAMER sites** that help modern brands grow** with clarity and confidence**',
  	\`about_tag\` text DEFAULT 'About',
  	\`about_image1_id\` integer,
  	\`about_caption\` text DEFAULT '**I build websites that feel** as good as they look. Clean, intentional,** and made to leave an impression.**',
  	\`about_image2_id\` integer,
  	\`about_result_tag\` text DEFAULT 'Driven Result',
  	\`about_result_heading\` text DEFAULT 'The work doesn’t just look good — it performs.** Here’s the impact behind the design.**',
  	\`showcase_reel_word1\` text DEFAULT 'Show',
  	\`showcase_reel_word2\` text DEFAULT 'Case',
  	\`showcase_video_id\` integer,
  	\`works_tag\` text DEFAULT 'Selected works(05)',
  	\`works_heading\` text DEFAULT 'A collection
  of **refined digital experiences**',
  	\`works_text\` text DEFAULT 'Every project here was shaped with intention —** from layout and typography to interaction and tone.**',
  	\`works_outro\` text DEFAULT 'These selected projects reflect **my approach to clarity, usability and design.** You can explore additional case studies and **work examples.**',
  	\`works_cta\` text DEFAULT 'Explore all works',
  	\`services_tag\` text DEFAULT 'Services(04)',
  	\`services_heading\` text DEFAULT 'Design
  **that speaks for you**',
  	\`services_text\` text DEFAULT 'I help brands and startups create digital experiences that feel clear, modern, and effortless to use.',
  	\`services_image1_id\` integer,
  	\`services_image2_id\` integer,
  	\`testimonials_tag\` text DEFAULT 'Testimonials(04)',
  	\`testimonials_heading\` text DEFAULT 'Words That
  **Carry Weight**',
  	\`testimonials_prev\` text DEFAULT 'Prev',
  	\`testimonials_next\` text DEFAULT 'Next',
  	\`clients_tag\` text DEFAULT 'Clients(08)',
  	\`clients_heading\` text DEFAULT 'Brands
  **I’ve Worked With**',
  	\`clients_text\` text DEFAULT 'I collaborate with **companies who care about thoughtful digital presence**. Each project is shaped through **understanding, refinement, and attention to detail.**',
  	\`clients_sentence\` text DEFAULT 'The goal is always the same: **design that communicates clearly and leaves a lasting impression.**',
  	\`clients_cta\` text DEFAULT 'Book a call',
  	\`approach_tag\` text DEFAULT 'Approach(04)',
  	\`approach_heading\` text DEFAULT 'Creative
  **Approach**',
  	\`approach_text\` text DEFAULT 'Every project is different, but the path to great work stays the same — a balance of research, clarity, creativity, and refinement.',
  	\`approach_image_id\` integer,
  	\`awards_tag\` text DEFAULT 'Awards & Recognitions',
  	\`awards_heading\` text DEFAULT 'Awards
  **that define the craft**',
  	\`awards_sentence\` text DEFAULT 'Over the years, my work in **development, design, and modern web development** has been recognized for its **clarity, creativity, and technical precision.**',
  	\`blogs_tag\` text DEFAULT 'Blogs(03)',
  	\`blogs_heading\` text DEFAULT 'Stories
  **behind the work**',
  	\`blogs_profile_text\` text DEFAULT 'I write to unpack the thinking behind **the work — the choices, the reasoning, and the quiet decisions that shape how a project feels and performs**',
  	\`blogs_cta\` text DEFAULT 'Read more blogs',
  	\`faq_tag\` text DEFAULT 'FAQ’S(08)',
  	\`faq_heading\` text DEFAULT 'Frequently
  **Asked Questions**',
  	\`faq_outro_heading\` text DEFAULT '**Didn’t find**
  **your answer?**',
  	\`faq_outro_text\` text DEFAULT 'No worries — just reach out. I’m always happy to clarify or walk you through anything.',
  	\`faq_outro_cta\` text DEFAULT 'Send me a message',
  	\`contact_tag\` text DEFAULT 'Contact',
  	\`contact_heading\` text DEFAULT 'Have a
  **Project in Mind?**',
  	\`contact_sentence\` text DEFAULT 'I’m always open to **collaborations and creative challenges.**',
  	\`contact_connect_label\` text DEFAULT 'Lets'' Connect',
  	\`contact_reply_note\` text DEFAULT 'I usually reply within **24 hours.**',
  	\`contact_submit\` text DEFAULT 'Send Request',
  	\`contact_submitting\` text DEFAULT 'Sending…',
  	\`contact_sent\` text DEFAULT 'Request sent',
  	\`contact_failed\` text DEFAULT 'Try again',
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`about_image1_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`about_image2_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`showcase_video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`services_image1_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`services_image2_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`approach_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`home_about_about_image1_idx\` ON \`home\` (\`about_image1_id\`);`)
  await db.run(sql`CREATE INDEX \`home_about_about_image2_idx\` ON \`home\` (\`about_image2_id\`);`)
  await db.run(sql`CREATE INDEX \`home_showcase_showcase_video_idx\` ON \`home\` (\`showcase_video_id\`);`)
  await db.run(sql`CREATE INDEX \`home_services_services_image1_idx\` ON \`home\` (\`services_image1_id\`);`)
  await db.run(sql`CREATE INDEX \`home_services_services_image2_idx\` ON \`home\` (\`services_image2_id\`);`)
  await db.run(sql`CREATE INDEX \`home_approach_approach_image_idx\` ON \`home\` (\`approach_image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`not_found_heading\` text DEFAULT '404',
  	\`not_found_text\` text DEFAULT 'It seems you’ve reached a page that doesn’t exist. Head back to the homepage or use the navigation above to continue exploring.',
  	\`not_found_cta\` text DEFAULT 'Back to Home',
  	\`works_tag\` text DEFAULT 'Case Studies',
  	\`works_heading\` text DEFAULT 'Built to
  **Stand Out**',
  	\`works_text\` text DEFAULT 'A set of projects that showcase clean thinking, strong execution, and design that actually works.',
  	\`blogs_tag\` text DEFAULT 'Blogs',
  	\`blogs_heading\` text DEFAULT 'From
  **My Desk**',
  	\`blogs_text\` text DEFAULT 'Simple thoughts on design, development, and creativity.',
  	\`work_labels_overview\` text DEFAULT 'Overview',
  	\`work_labels_date\` text DEFAULT 'Date:',
  	\`work_labels_client\` text DEFAULT 'Client:',
  	\`work_labels_industry\` text DEFAULT 'Industry:',
  	\`work_labels_services\` text DEFAULT 'Services:',
  	\`work_labels_live\` text DEFAULT 'Live Project:',
  	\`work_labels_next\` text DEFAULT 'Next Project',
  	\`work_labels_cta\` text DEFAULT 'Explore all works',
  	\`blog_labels_next\` text DEFAULT 'Next Blogs',
  	\`blog_labels_cta\` text DEFAULT 'Explore all blogs',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`ALTER TABLE \`works\` ADD \`_order\` text;`)
  await db.run(sql`CREATE INDEX \`works__order_idx\` ON \`works\` (\`_order\`);`)
  await carryOrderOver(db, 'works')
  await db.run(sql`ALTER TABLE \`works\` DROP COLUMN \`order\`;`)
  await db.run(sql`ALTER TABLE \`posts\` ADD \`_order\` text;`)
  await db.run(sql`CREATE INDEX \`posts__order_idx\` ON \`posts\` (\`_order\`);`)
  await carryOrderOver(db, 'posts')
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`order\`;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`services_id\` integer REFERENCES services(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`testimonials_id\` integer REFERENCES testimonials(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`clients_id\` integer REFERENCES clients(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`awards_id\` integer REFERENCES awards(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`faqs_id\` integer REFERENCES faqs(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_services_id_idx\` ON \`payload_locked_documents_rels\` (\`services_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_testimonials_id_idx\` ON \`payload_locked_documents_rels\` (\`testimonials_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_clients_id_idx\` ON \`payload_locked_documents_rels\` (\`clients_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_awards_id_idx\` ON \`payload_locked_documents_rels\` (\`awards_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_faqs_id_idx\` ON \`payload_locked_documents_rels\` (\`faqs_id\`);`)
  await db.run(sql`ALTER TABLE \`site\` ADD \`tagline\` text DEFAULT 'Crafting thoughtful digital experiences built on** clarity, purpose, and precision.**';`)
  // Fold the old two-part footer tagline into the single marked-text field, so a customised
  // footer survives instead of being replaced by the column default above.
  await db.run(sql`UPDATE site SET tagline = COALESCE(tagline_muted,'') || CASE WHEN COALESCE(tagline_strong,'') <> '' THEN '**' || tagline_strong || '**' ELSE '' END WHERE tagline_muted IS NOT NULL OR tagline_strong IS NOT NULL`)
  await db.run(sql`ALTER TABLE \`site\` DROP COLUMN \`tagline_muted\`;`)
  await db.run(sql`ALTER TABLE \`site\` DROP COLUMN \`tagline_strong\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`services_tags\`;`)
  await db.run(sql`DROP TABLE \`services\`;`)
  await db.run(sql`DROP TABLE \`testimonials\`;`)
  await db.run(sql`DROP TABLE \`clients\`;`)
  await db.run(sql`DROP TABLE \`awards\`;`)
  await db.run(sql`DROP TABLE \`faqs\`;`)
  await db.run(sql`DROP TABLE \`home_hero_bio\`;`)
  await db.run(sql`DROP TABLE \`home_about_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`home_about_metrics\`;`)
  await db.run(sql`DROP TABLE \`home_approach_steps\`;`)
  await db.run(sql`DROP TABLE \`home_contact_fields\`;`)
  await db.run(sql`DROP TABLE \`home\`;`)
  await db.run(sql`DROP TABLE \`pages\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`works_id\` integer,
  	\`posts_id\` integer,
  	\`media_id\` integer,
  	\`messages_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`works_id\`) REFERENCES \`works\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`messages_id\`) REFERENCES \`messages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "works_id", "posts_id", "media_id", "messages_id", "users_id") SELECT "id", "order", "parent_id", "path", "works_id", "posts_id", "media_id", "messages_id", "users_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_works_id_idx\` ON \`payload_locked_documents_rels\` (\`works_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_messages_id_idx\` ON \`payload_locked_documents_rels\` (\`messages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`DROP INDEX \`works__order_idx\`;`)
  await db.run(sql`ALTER TABLE \`works\` ADD \`order\` numeric DEFAULT 0 NOT NULL;`)
  await db.run(sql`ALTER TABLE \`works\` DROP COLUMN \`_order\`;`)
  await db.run(sql`DROP INDEX \`posts__order_idx\`;`)
  await db.run(sql`ALTER TABLE \`posts\` ADD \`order\` numeric DEFAULT 0 NOT NULL;`)
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`_order\`;`)
  await db.run(sql`ALTER TABLE \`site\` ADD \`tagline_muted\` text DEFAULT 'Crafting thoughtful digital experiences built on';`)
  await db.run(sql`ALTER TABLE \`site\` ADD \`tagline_strong\` text DEFAULT ' clarity, purpose, and precision.';`)
  await db.run(sql`ALTER TABLE \`site\` DROP COLUMN \`tagline\`;`)
}
