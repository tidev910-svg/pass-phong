"use client";

import { Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import styles from "./HeroSearchCTA.module.css";

/**
 * Nút "Tìm ngay" — to, màu mustard (khác hẳn mọi nút primary forest còn lại
 * trên trang) để nổi bật. Component thuần trình bày, hành vi khi bấm do nơi
 * gọi quyết định qua `onClick` (hiện dùng ở `HomeSearchSection` để mở chế độ
 * "Tìm theo nhu cầu", thay cho vị trí Segmented "Theo khu vực"/"Theo nhu cầu"
 * cũ).
 */
export function HeroSearchCTA({ onClick }: { onClick: () => void }) {
  return (
    <div className={styles.wrap}>
      <Button type="primary" size="large" icon={<SearchOutlined />} className={styles.button} onClick={onClick}>
        Tìm ngay
      </Button>
    </div>
  );
}
