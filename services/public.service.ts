import { db, schema } from "@/db";
import { desc, asc, eq } from "drizzle-orm";

export async function getStrukturOrganisasi() {
  return db
    .select()
    .from(schema.struktur_organisasi)
    .orderBy(asc(schema.struktur_organisasi.urutan));
}

export async function getLayananCards() {
  return db
    .select()
    .from(schema.layanan_cards)
    .orderBy(desc(schema.layanan_cards.created_at));
}

export async function getKegiatanDocuments() {
  return db
    .select()
    .from(schema.kegiatan_documents)
    .orderBy(desc(schema.kegiatan_documents.created_at));
}

export async function getHeroImages() {
  return db
    .select()
    .from(schema.hero_images)
    .where(eq(schema.hero_images.is_active, true))
    .orderBy(asc(schema.hero_images.order_index));
}

export async function getPublikasi() {
  return db
    .select()
    .from(schema.publications)
    .orderBy(desc(schema.publications.created_at));
}

export async function getPrakiraanCategories() {
  return db
    .select()
    .from(schema.prakiraan_categories)
    .orderBy(desc(schema.prakiraan_categories.created_at));
}

export async function getDisplaySlides() {
  return db
    .select()
    .from(schema.display_slides)
    .orderBy(asc(schema.display_slides.order));
}
