import L from "leaflet";
import styles from "./MapIcons.module.css";

/**
 * Ghim tròn đơn giản (không hiện giá) — dùng cho `LocationPicker` (chọn vị
 * trí đăng tin/sửa tin) và cho điểm tâm tìm kiếm ở chế độ "Tìm theo nhu cầu"
 * (`ListingsMap`). Tách khỏi `buildPriceIcon` (`ListingsMap.tsx`) vì đó là
 * icon hiển thị giá cho từng tin, mục đích khác hẳn.
 */
export function buildLocationPinIcon(): L.DivIcon {
  return L.divIcon({
    className: styles.pinWrap,
    html: `<span class="${styles.pin}"></span>`,
    iconSize: [26, 26],
    // Neo đúng đầu nhọn (góc dưới-trái trước khi xoay) vào toạ độ.
    iconAnchor: [13, 26],
  });
}
