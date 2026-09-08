-- Seed khu vực gốc — đồng bộ thủ công với src/lib/constants/regions-seed.ts.
-- Thêm khu vực mới: thêm 1 dòng ở đây + 1 phần tử trong regions-seed.ts.

insert into regions (slug, name, city, display_order, is_active) values
  ('ninh-kieu-khu2', 'Ninh Kiều (gần ĐH Cần Thơ khu 2)', 'Can Tho', 1, true),
  ('ninh-kieu-khu3', 'Ninh Kiều (gần ĐH Cần Thơ khu 3)', 'Can Tho', 2, true),
  ('ninh-kieu-khac', 'Ninh Kiều (khu vực khác)', 'Can Tho', 3, true),
  ('binh-thuy', 'Bình Thủy', 'Can Tho', 4, true),
  ('cai-rang', 'Cái Răng', 'Can Tho', 5, true),
  ('o-mon', 'Ô Môn', 'Can Tho', 6, true),
  ('khac', 'Khu vực khác', 'Can Tho', 7, true)
on conflict (slug) do nothing;
