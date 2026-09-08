-- Báo cáo tin (tính năng optional theo CLAUDE.md).
-- "Xác nhận pass thành công" KHÔNG có bảng riêng — dùng trực tiếp
-- listings.status = 'passed' + listings.passed_confirmed_at (đã có ở 0001_init.sql),
-- vì quan hệ 1-1 và không cần audit trail cho MVP.

create table reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  reason text not null,
  note text,
  created_at timestamptz not null default now(),
  status text not null default 'open' check (status in ('open', 'reviewed'))
);

alter table reports enable row level security;
create index idx_reports_listing on reports(listing_id);
