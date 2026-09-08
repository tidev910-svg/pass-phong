/** Tâm bản đồ mặc định (trung tâm Cần Thơ) — dùng chung cho mọi bản đồ trong
 * app (`ListingsMap`, `LocationPickerMap`) để tránh khai trùng nhiều nơi.
 * Zoom mặc định thì KHÔNG gộp — mỗi bản đồ có mục đích khác nhau (xem toàn
 * cảnh nhiều pin vs ghim chính xác 1 điểm) nên vẫn khai riêng ở từng file. */
export const CAN_THO_CENTER: [number, number] = [10.03, 105.77];
