import type { Metadata } from "next";

export const metadata: Metadata = { title: "Điều khoản sử dụng" };

export default function TermsPage() {
  return (
    <article style={{ lineHeight: 1.7 }}>
      <h1>Điều khoản sử dụng</h1>
      <p>
        Pass Phòng Cần Thơ là nền tảng trung gian, chỉ đóng vai trò kết nối giữa
        người đăng tin pass phòng và người tìm phòng. Bằng việc sử dụng trang
        web, bạn đồng ý với các điều khoản dưới đây.
      </p>

      <h4>1. Vai trò của nền tảng</h4>
      <p>
        Chúng tôi không xác minh thông tin phòng, chủ nhà, tình trạng hợp đồng
        thuê, hay việc chủ nhà có đồng ý cho chuyển nhượng/sang nhượng hay
        không. Mọi nội dung tin đăng là do người dùng tự cung cấp và tự chịu
        trách nhiệm.
      </p>

      <h4>2. Trách nhiệm giao dịch</h4>
      <p>
        Pass Phòng Cần Thơ không tham gia, không chứng kiến và không chịu
        trách nhiệm về bất kỳ giao dịch, thoả thuận, khoản cọc hay tranh chấp
        nào phát sinh giữa người đăng tin và người liên hệ qua tin đăng. Người
        dùng cần tự xác minh thông tin và cân nhắc kỹ trước khi giao dịch.
      </p>

      <h4>3. Nội dung tin đăng</h4>
      <p>
        Tin đăng chưa qua kiểm duyệt tự động. Nếu phát hiện tin có dấu hiệu
        lừa đảo hoặc sai sự thật, vui lòng dùng chức năng báo cáo trên trang
        chi tiết tin hoặc liên hệ đội ngũ vận hành để được xử lý.
      </p>
    </article>
  );
}
