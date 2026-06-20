import {
  mysqlTable, varchar, text, int, boolean, timestamp, date, json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 50 }).notNull().default("karyawan"),
  nama: varchar("nama", { length: 255 }).default(""),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const buku_tamu = mysqlTable("buku_tamu", {
  id: varchar("id", { length: 36 }).primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  no_telepon: varchar("no_telepon", { length: 50 }).notNull(),
  instansi: varchar("instansi", { length: 255 }).default(""),
  keperluan: text("keperluan").notNull(),
  foto_url: text("foto_url"),
  foto_data: text("foto_data"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const hero_images = mysqlTable("hero_images", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  order_index: int("order_index").notNull().default(0),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const prakiraan_categories = mysqlTable("prakiraan_categories", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }).default("Sun"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const prakiraan_images = mysqlTable("prakiraan_images", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  url: text("url").notNull(),
  slug: varchar("slug", { length: 255 }).default(""),
  explanation: text("explanation"),
  waktu_mulai: timestamp("waktu_mulai"),
  waktu_berakhir: timestamp("waktu_berakhir"),
  next_url: text("next_url"),
  next_explanation: text("next_explanation"),
  next_waktu_mulai: timestamp("next_waktu_mulai"),
  next_waktu_berakhir: timestamp("next_waktu_berakhir"),
  display_type: varchar("display_type", { length: 50 }),
  gallery_images: json("gallery_images"),
  prioritas: int("prioritas").default(1),
  category_id: varchar("category_id", { length: 36 }),
  uploader: varchar("uploader", { length: 255 }).default(""),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const kegiatan_documents = mysqlTable("kegiatan_documents", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 255 }),
  url: text("url").notNull(),
  file_path: text("file_path"),
  file_type: varchar("file_type", { length: 50 }),
  event_date: date("event_date"),
  image_urls: json("image_urls").default([]),
  youtube_url: text("youtube_url"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const layanan_cards = mysqlTable("layanan_cards", {
  id: varchar("id", { length: 36 }).primaryKey(),
  nama_layanan: varchar("nama_layanan", { length: 255 }).notNull(),
  deskripsi: text("deskripsi"),
  url_google_form: text("url_google_form"),
  cover_url: text("cover_url"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const struktur_organisasi = mysqlTable("struktur_organisasi", {
  id: varchar("id", { length: 36 }).primaryKey(),
  jabatan: varchar("jabatan", { length: 255 }).notNull(),
  nama: varchar("nama", { length: 255 }).notNull(),
  inisial: varchar("inisial", { length: 50 }).notNull(),
  deskripsi: text("deskripsi"),
  urutan: int("urutan").notNull().default(0),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const display_slides = mysqlTable("display", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull().default(""),
  url: text("url").notNull(),
  order: int("order").notNull().default(0),
  uploader: varchar("uploader", { length: 255 }).default(""),
  waktu_berakhir: timestamp("waktu_berakhir"),
  created_at: timestamp("created_at").defaultNow(),
});

export const publications = mysqlTable("publications", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull().default(""),
  description: text("description"),
  url: text("url").notNull(),
  file_path: text("file_path"),
  cover_url: text("cover_url"),
  uploader: varchar("uploader", { length: 255 }).default(""),
  created_at: timestamp("created_at").defaultNow(),
});

export const login_logs = mysqlTable("login_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  user_id: varchar("user_id", { length: 36 }),
  username: varchar("username", { length: 255 }).notNull(),
  ip_address: varchar("ip_address", { length: 45 }),
  user_agent: text("user_agent"),
  aktivitas: varchar("aktivitas", { length: 255 }).default("login"),
  created_at: timestamp("created_at").defaultNow(),
});
