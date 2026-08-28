import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Rebuilds \`home\` without \`showcase_reel_word1/2\` and \`showcase_video_id\`, replaced by \`showcase_app_name\`.
  // The copy substitutes the field default for the new column — the old table has nothing to carry over.
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_home\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_intro\` text DEFAULT 'I create digital experiences that feel** effortless to use and powerful in impact—FRAMER sites** that help modern brands grow** with clarity and confidence**',
  	\`about_tag\` text DEFAULT 'About',
  	\`about_image1_id\` integer,
  	\`about_caption\` text DEFAULT '**I build websites that feel** as good as they look. Clean, intentional,** and made to leave an impression.**',
  	\`about_image2_id\` integer,
  	\`about_result_tag\` text DEFAULT 'Driven Result',
  	\`about_result_heading\` text DEFAULT 'The work doesn’t just look good — it performs.** Here’s the impact behind the design.**',
  	\`showcase_app_name\` text DEFAULT 'Ledger',
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
  	FOREIGN KEY (\`services_image1_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`services_image2_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`approach_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_home\`("id", "hero_intro", "about_tag", "about_image1_id", "about_caption", "about_image2_id", "about_result_tag", "about_result_heading", "showcase_app_name", "works_tag", "works_heading", "works_text", "works_outro", "works_cta", "services_tag", "services_heading", "services_text", "services_image1_id", "services_image2_id", "testimonials_tag", "testimonials_heading", "testimonials_prev", "testimonials_next", "clients_tag", "clients_heading", "clients_text", "clients_sentence", "clients_cta", "approach_tag", "approach_heading", "approach_text", "approach_image_id", "awards_tag", "awards_heading", "awards_sentence", "blogs_tag", "blogs_heading", "blogs_profile_text", "blogs_cta", "faq_tag", "faq_heading", "faq_outro_heading", "faq_outro_text", "faq_outro_cta", "contact_tag", "contact_heading", "contact_sentence", "contact_connect_label", "contact_reply_note", "contact_submit", "contact_submitting", "contact_sent", "contact_failed", "updated_at", "created_at") SELECT "id", "hero_intro", "about_tag", "about_image1_id", "about_caption", "about_image2_id", "about_result_tag", "about_result_heading", 'Ledger', "works_tag", "works_heading", "works_text", "works_outro", "works_cta", "services_tag", "services_heading", "services_text", "services_image1_id", "services_image2_id", "testimonials_tag", "testimonials_heading", "testimonials_prev", "testimonials_next", "clients_tag", "clients_heading", "clients_text", "clients_sentence", "clients_cta", "approach_tag", "approach_heading", "approach_text", "approach_image_id", "awards_tag", "awards_heading", "awards_sentence", "blogs_tag", "blogs_heading", "blogs_profile_text", "blogs_cta", "faq_tag", "faq_heading", "faq_outro_heading", "faq_outro_text", "faq_outro_cta", "contact_tag", "contact_heading", "contact_sentence", "contact_connect_label", "contact_reply_note", "contact_submit", "contact_submitting", "contact_sent", "contact_failed", "updated_at", "created_at" FROM \`home\`;`)
  await db.run(sql`DROP TABLE \`home\`;`)
  await db.run(sql`ALTER TABLE \`__new_home\` RENAME TO \`home\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`home_about_about_image1_idx\` ON \`home\` (\`about_image1_id\`);`)
  await db.run(sql`CREATE INDEX \`home_about_about_image2_idx\` ON \`home\` (\`about_image2_id\`);`)
  await db.run(sql`CREATE INDEX \`home_services_services_image1_idx\` ON \`home\` (\`services_image1_id\`);`)
  await db.run(sql`CREATE INDEX \`home_services_services_image2_idx\` ON \`home\` (\`services_image2_id\`);`)
  await db.run(sql`CREATE INDEX \`home_approach_approach_image_idx\` ON \`home\` (\`approach_image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`home\` ADD \`showcase_reel_word1\` text DEFAULT 'Show';`)
  await db.run(sql`ALTER TABLE \`home\` ADD \`showcase_reel_word2\` text DEFAULT 'Case';`)
  await db.run(sql`ALTER TABLE \`home\` ADD \`showcase_video_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`home_showcase_showcase_video_idx\` ON \`home\` (\`showcase_video_id\`);`)
  await db.run(sql`ALTER TABLE \`home\` DROP COLUMN \`showcase_app_name\`;`)
}
