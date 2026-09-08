"use client";

import { Tag, Typography } from "antd";
import type { ListingTag, ListingTagCategory } from "@/domain/listing-tags/types";
import { checkableTagStyle } from "@/components/search/regionTagStyle";

const CATEGORY_LABEL: Record<ListingTagCategory, string> = {
  room_type: "Loại phòng",
  amenity: "Tiện ích",
};

/**
 * Chọn loại phòng/tiện ích — dùng chung ở form đăng tin/sửa tin (gắn tag cho
 * tin) VÀ form thiết lập sở thích Bảng tin (chọn tag quan tâm). Gom theo
 * `category`, mỗi nhóm hiện trên 1 hàng riêng với label nhóm.
 */
export function TagPicker({
  tags,
  // `value`/`onChange` optional với default rỗng/no-op — cho phép dùng như 1
  // field antd `Form.Item` bình thường (Form tự inject value/onChange qua
  // `cloneElement`, ghi đè lên default ở đây) mà không cần truyền props giả
  // ở nơi gọi.
  value = [],
  onChange = () => {},
  singleSelectCategories = [],
}: {
  tags: ListingTag[];
  value?: number[];
  onChange?: (tagIds: number[]) => void;
  /** Category nào chọn 1 thì tự bỏ chọn cái khác cùng nhóm — vd "room_type"
   * (ở ghép XOR phòng riêng) ở form đăng tin. Để trống cho sở thích Bảng
   * tin, nơi 1 người có thể quan tâm cả 2. */
  singleSelectCategories?: ListingTagCategory[];
}) {
  const byCategory = new Map<ListingTagCategory, ListingTag[]>();
  for (const tag of tags) {
    const group = byCategory.get(tag.category) ?? [];
    group.push(tag);
    byCategory.set(tag.category, group);
  }

  function toggle(tag: ListingTag) {
    const checked = value.includes(tag.id);
    if (checked) {
      onChange(value.filter((id) => id !== tag.id));
      return;
    }
    if (singleSelectCategories.includes(tag.category)) {
      const sameGroupIds = new Set((byCategory.get(tag.category) ?? []).map((t) => t.id));
      onChange([...value.filter((id) => !sameGroupIds.has(id)), tag.id]);
      return;
    }
    onChange([...value, tag.id]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[...byCategory.entries()].map(([category, groupTags]) => (
        <div key={category}>
          <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
            {CATEGORY_LABEL[category]}
          </Typography.Text>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {groupTags.map((tag) => {
              const checked = value.includes(tag.id);
              return (
                <Tag.CheckableTag
                  key={tag.id}
                  checked={checked}
                  onChange={() => toggle(tag)}
                  style={checkableTagStyle(checked)}
                >
                  {tag.label}
                </Tag.CheckableTag>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
