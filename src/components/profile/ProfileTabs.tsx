"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Col, Row, Tabs } from "antd";
import type { Region } from "@/domain/regions/types";
import type { ListingTag } from "@/domain/listing-tags/types";
import type { FeedPreferences } from "@/domain/feed/types";
import { EmptyState } from "@/components/feedback/EmptyState";
import { MyListingCard, type MyListingItem } from "@/components/listings/MyListingCard";
import { ListingGridView } from "@/components/listings/ListingGridView";
import type { ListingCardViewModel } from "@/components/listings/ListingCard";
import { SavedSearchListView, type SavedSearchViewModel } from "@/components/search/SavedSearchListView";
import { FeedPreferencesForm } from "@/components/feed/FeedPreferencesForm";
import { AccountSettingsForm } from "./AccountSettingsForm";
import styles from "./ProfileTabs.module.css";

export function ProfileTabs({
  myListings,
  savedSearches,
  initialDisplayName,
  initialPhoneOrZalo,
  feedRegions,
  feedTags,
  feedPreferences,
  savedListings,
}: {
  myListings: MyListingItem[];
  savedSearches: SavedSearchViewModel[];
  initialDisplayName: string;
  initialPhoneOrZalo: string;
  feedRegions: Region[];
  feedTags: ListingTag[];
  feedPreferences: FeedPreferences | null;
  savedListings: ListingCardViewModel[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const validKeys = ["listings", "saved-searches", "settings", "so-thich", "tin-da-luu"];
  const tabFromUrl = searchParams.get("tab");
  const [activeKey, setActiveKey] = useState(
    tabFromUrl && validKeys.includes(tabFromUrl) ? tabFromUrl : "listings",
  );

  // Đồng bộ URL khi đổi tab (không reload trang) — cho phép deep-link thẳng
  // tới 1 tab cụ thể (vd dropdown tài khoản ở header trỏ "?tab=settings").
  function handleChange(key: string) {
    setActiveKey(key);
    router.replace(key === "listings" ? "/tai-khoan" : `/tai-khoan?tab=${key}`, { scroll: false });
  }

  return (
    <div className={styles.wrap}>
      <Tabs
        activeKey={activeKey}
        onChange={handleChange}
        items={[
          {
            key: "listings",
            label: "Tin của tôi",
            children:
              myListings.length === 0 ? (
                <EmptyState
                  title="Bạn chưa đăng tin nào"
                  description="Vào trang Đăng tin để đăng tin pass phòng đầu tiên."
                />
              ) : (
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                  {myListings.map((item) => (
                    <Col key={item.id} xs={24} sm={12} lg={8}>
                      <MyListingCard item={item} />
                    </Col>
                  ))}
                </Row>
              ),
          },
          {
            key: "saved-searches",
            label: "Tìm kiếm đã lưu",
            children: (
              <div style={{ marginTop: 16 }}>
                <SavedSearchListView searches={savedSearches} />
              </div>
            ),
          },
          {
            key: "tin-da-luu",
            label: "Tin đã lưu",
            children: (
              <div style={{ marginTop: 16 }}>
                {savedListings.length === 0 ? (
                  <EmptyState
                    title="Bạn chưa lưu tin nào"
                    description="Bấm nút Lưu tin ở Bảng tin hoặc trang chi tiết tin để xem lại sau."
                  />
                ) : (
                  <ListingGridView items={savedListings} />
                )}
              </div>
            ),
          },
          {
            key: "settings",
            label: "Cài đặt tài khoản",
            children: (
              <div style={{ marginTop: 16 }}>
                <AccountSettingsForm
                  initialDisplayName={initialDisplayName}
                  initialPhoneOrZalo={initialPhoneOrZalo}
                />
              </div>
            ),
          },
          {
            key: "so-thich",
            label: "Sở thích Bảng tin",
            children: (
              <div style={{ marginTop: 16 }}>
                <FeedPreferencesForm
                  regions={feedRegions}
                  tags={feedTags}
                  initialPreferences={feedPreferences}
                  mode="edit"
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
