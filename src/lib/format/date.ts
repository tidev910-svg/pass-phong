import dayjs, { type Dayjs } from "dayjs";

const ISO_DATE_FORMAT = "YYYY-MM-DD";

/** Chuyển giá trị `Dayjs` của antd DatePicker thành ISO date lưu DB. */
export function dayjsToIsoDate(value: Dayjs | null | undefined): string | undefined {
  if (!value) return undefined;
  return value.format(ISO_DATE_FORMAT);
}

/** Chuyển ISO date từ DB thành `Dayjs` để antd DatePicker hiển thị. */
export function isoDateToDayjs(value: string | null | undefined): Dayjs | undefined {
  if (!value) return undefined;
  return dayjs(value, ISO_DATE_FORMAT);
}
