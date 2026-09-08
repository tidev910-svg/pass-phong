-- Trang "tin bị báo cáo" ở web admin riêng lọc liên tục theo
-- status='open' — reports mới chỉ index theo listing_id (0003), thêm index
-- theo status. Thuần index, không đổi hành vi/dữ liệu.

create index idx_reports_status on reports(status);
