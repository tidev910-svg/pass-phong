"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Card, Carousel, Col, Image, Row, Tag } from "antd";
import type { CarouselRef } from "antd/es/carousel";
import { CalendarOutlined } from "@ant-design/icons";
import { COLOR_FOREST, COLOR_PAPER } from "@/theme/tokens";
import { Price } from "./Price";
import { ContactBadge } from "./ContactBadge";
import { ListingOwnerActions } from "./ListingOwnerActions";
import { ReportListingButton } from "./ReportListingButton";
import { ListingActionToast } from "./ListingActionToast";
import { SaveListingButton } from "./SaveListingButton";

/** Style ảnh dùng chung cho cả trường hợp 1 ảnh và ảnh trong slider — giữ
 * đúng khung 4:3 + viền ink 2px như bản cũ, không đổi ngôn ngữ hình ảnh. */
const GALLERY_IMAGE_STYLE: CSSProperties = {
  width: "100%",
  borderRadius: 8,
  border: "2px solid var(--ink)",
  aspectRatio: "4/3",
  objectFit: "cover",
};

export interface ListingDetailViewModel {
  id: string;
  regionName: string;
  price: number;
  moveOutDateLabel: string;
  createdAtLabel: string;
  description: string | null;
  contactPhone: string | null;
  contactLink: string | null;
  isPassed: boolean;
  isActive: boolean;
  imageUrls: string[];
  tags: { id: number; label: string }[];
  isSaved: boolean;
  saveCount: number;
}

export function ListingDetailView({
  listing,
  isOwner,
  isLoggedIn,
}: {
  listing: ListingDetailViewModel;
  isOwner: boolean;
  isLoggedIn: boolean;
}) {
  const carouselRef = useRef<CarouselRef>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const hasMultipleImages = listing.imageUrls.length > 1;

  return (
    <>
      <ListingActionToast />
      <Row gutter={[24, 24]}>
        <Col xs={24} md={14}>
          {listing.imageUrls.length > 0 ? (
            <Image.PreviewGroup items={listing.imageUrls}>
              {hasMultipleImages ? (
                <>
                  <Carousel
                    ref={carouselRef}
                    afterChange={setActiveSlide}
                    arrows
                    infinite={false}
                    className="listing-gallery-carousel"
                  >
                    {listing.imageUrls.map((url) => (
                      <div key={url}>
                        <Image src={url} alt="Ảnh phòng" style={GALLERY_IMAGE_STYLE} preview={{ mask: "Xem ảnh lớn" }} />
                      </div>
                    ))}
                  </Carousel>
                  <div className="listing-gallery-thumbs">
                    {listing.imageUrls.map((url, index) => (
                      <button
                        key={url}
                        type="button"
                        className={`listing-gallery-thumb${index === activeSlide ? " is-active" : ""}`}
                        onClick={() => carouselRef.current?.goTo(index)}
                        aria-label={`Xem ảnh ${index + 1}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <Image src={listing.imageUrls[0]} alt="Ảnh phòng" style={GALLERY_IMAGE_STYLE} preview={{ mask: "Xem ảnh lớn" }} />
              )}
            </Image.PreviewGroup>
          ) : (
            <div
              className="board-panel"
              style={{
                aspectRatio: "16/9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLOR_PAPER,
                fontWeight: 700,
                fontSize: 18,
                background: COLOR_FOREST,
                border: "none",
              }}
            >
              {listing.regionName}
            </div>
          )}
        </Col>

        <Col xs={24} md={10}>
          <Card variant="borderless" className="board-panel" styles={{ body: { padding: 24 } }}>
            {listing.isPassed && (
              <Tag color="success" style={{ marginBottom: 12 }}>
                Đã pass thành công
              </Tag>
            )}
            <Tag color={COLOR_FOREST}>{listing.regionName}</Tag>
            {listing.tags.map((tag) => (
              <Tag key={tag.id}>{tag.label}</Tag>
            ))}

            <div style={{ marginTop: 12 }}>
              <Price value={listing.price} size="lg" />
            </div>

            <div
              style={{
                marginTop: 10,
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: COLOR_FOREST,
                fontWeight: 700,
              }}
            >
              <CalendarOutlined />
              <span>Cần pass trước ngày {listing.moveOutDateLabel}</span>
            </div>
            <p style={{ marginTop: 2, marginBottom: 0, color: "var(--ink-soft)", fontSize: 13 }}>
              Đăng {listing.createdAtLabel}
            </p>

            {listing.description && (
              <p style={{ marginTop: 12, whiteSpace: "pre-line" }}>{listing.description}</p>
            )}

            <div className="listing-contact-panel">
              <h5 style={{ marginTop: 0, marginBottom: 8, color: COLOR_FOREST }}>Liên hệ</h5>
              <ContactBadge phone={listing.contactPhone} link={listing.contactLink} />
            </div>

            {isOwner && listing.isActive && (
              <div style={{ marginTop: 20 }}>
                <ListingOwnerActions listingId={listing.id} />
              </div>
            )}

            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <SaveListingButton
                listingId={listing.id}
                initialSaved={listing.isSaved}
                initialCount={listing.saveCount}
                isLoggedIn={isLoggedIn}
              />
              <ReportListingButton listingId={listing.id} />
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
}
