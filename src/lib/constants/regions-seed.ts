/**
 * Danh sách khu vực gốc (nguồn tham chiếu duy nhất cho migration seed).
 * Thêm khu vực/thành phố mới: thêm phần tử vào đây rồi thêm 1 dòng insert
 * tương ứng vào `supabase/migrations/seed.sql` — không cần đổi code domain
 * hay UI, vì mọi nơi đều đọc khu vực từ bảng `regions` lúc runtime.
 */
export interface RegionSeed {
  slug: string;
  name: string;
  city: string;
  displayOrder: number;
}

export const REGION_SEED: readonly RegionSeed[] = [
  { slug: "ninh-kieu-khu2", name: "Ninh Kiều (gần ĐH Cần Thơ khu 2)", city: "Can Tho", displayOrder: 1 },
  { slug: "ninh-kieu-khu3", name: "Ninh Kiều (gần ĐH Cần Thơ khu 3)", city: "Can Tho", displayOrder: 2 },
  { slug: "ninh-kieu-khac", name: "Ninh Kiều (khu vực khác)", city: "Can Tho", displayOrder: 3 },
  { slug: "binh-thuy", name: "Bình Thủy", city: "Can Tho", displayOrder: 4 },
  { slug: "cai-rang", name: "Cái Răng", city: "Can Tho", displayOrder: 5 },
  { slug: "o-mon", name: "Ô Môn", city: "Can Tho", displayOrder: 6 },
  { slug: "khac", name: "Khu vực khác", city: "Can Tho", displayOrder: 7 },
];
