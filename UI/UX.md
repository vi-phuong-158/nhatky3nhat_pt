BẢN MÔ TẢ THIẾT KẾ UI/UX - DỰ ÁN SỐ HOÁ "NHẬT KÝ 3 NHẤT"

Dự án: Ứng dụng Web Nhật ký 3 Nhất (Scrapbook Style)
Đơn vị: Chi đoàn Phòng An ninh đối ngoại - Công an tỉnh Phú Thọ
Người thiết kế/Phát triển: Đ/c Vi Ngọc Phương

1. TỔNG QUAN & TRIẾT LÝ THIẾT KẾ (PHILOSOPHY)

Phong cách: Sổ lưu niệm (Scrapbook) điện tử kết hợp hiệu ứng 3D tả thực.

Cảm xúc mang lại: Trang trọng, tự hào (phù hợp với lực lượng CAND), nhưng vẫn mang nét lãng mạn, thanh lịch và giàu cảm xúc của một cuốn lưu bút tuổi trẻ.

Trải nghiệm (UX): Tối giản thao tác. Người dùng có cảm giác như đang thực sự lật giở từng trang giấy, xem từng bức ảnh kỉ niệm được dán trên đó.

1. BẢNG MÀU CHỦ ĐẠO (COLOR PALETTE) & TYPOGRAPHY

2.1. Bảng màu (Theo yêu cầu tuỳ chỉnh):

Màu Bìa sổ (Primary Background): Cherry Red (#FF4747) - Đỏ Cherry rực rỡ, tươi sáng, mang nhiệt huyết tuổi trẻ.

Màu Chữ & Hoạ tiết Bìa (Primary Accent): Butter Yellow (#F7E998) - Vàng bơ hoàng gia, tạo độ tương phản cao và sang trọng khi đặt trên nền Cherry Red.

Màu Nền Trang giấy trong: #E6E2D3 (Màu kem giấy cổ) kết hợp ánh sáng hắt nhẹ.

Màu Chữ Nội dung: #292524 (Xám đen Stone-800) giúp dịu mắt khi đọc văn bản dài.

2.2. Nghệ thuật chữ (Typography):

Tiêu đề Bìa & Nội dung Nhật ký: Sử dụng Font chữ có chân (Serif) như Georgia hoặc Times New Roman, in nghiêng nhẹ ở các đoạn trích dẫn để tạo cảm giác "chữ viết tay" hoặc "văn bản đánh máy cổ điển".

Nút bấm & Giao diện (UI): Sử dụng Font chữ không chân (Sans-serif) như Inter hoặc Roboto để đảm bảo độ sắc nét, hiện đại, dễ thao tác trên điện thoại.

1. CHI TIẾT CÁC THÀNH PHẦN GIAO DIỆN

3.1. Giao diện Bìa Sổ (Cover)

Chất liệu: Nền Đỏ Cherry #FF4747 có phủ một lớp vân da mờ (Leather texture) để tạo độ chân thực.

Bố cục từ trên xuống:

Icon Lá chắn (Shield) màu Butter Yellow #F7E998 (Đại diện cho CAND).

Dòng chữ in hoa nhỏ: HỘI PHỤ NỮ CÔNG AN TỈNH PHÚ THỌ

Dòng chữ nhỏ hơn: BAN PHỤ NỮ

Tiêu đề chính: Chữ "Nhật ký" (Cỡ chữ to vừa, font Serif) và "BA NHẤT" (Cỡ chữ khổng lồ, in hoa, đậm) đều dùng màu #F7E998, có đổ bóng (Drop-shadow) để tạo khối chữ nổi 3D.

Nút "MỞ SỔ NHẬT KÝ": Nền gradient Vàng bơ, chữ màu Đỏ Cherry, bo góc tròn.

3.2. Giao diện Đọc Nhật ký (Scrapbook Pages)

Mỗi mặt giấy hiển thị trọn vẹn 1 bài viết.

Hình nền (Background): Ảnh bìa của hoạt động đó sẽ được phóng to phủ kín toàn bộ trang giấy.

Lớp phủ (Overlay): Phủ một lớp Gradient từ Đen (dưới) lên trong suốt (trên) để đảm bảo chữ viết luôn hiển thị rõ ràng dù ảnh nền sáng hay tối.

Nội dung:

Góc trên: Dòng chữ "NHẬT KÝ BA NHẤT" và Khung thời gian (Ví dụ: Tuần: 23/3 - 27/3/2026).

Giữa trang: Nội dung câu chuyện, font Serif, text-justify (căn đều 2 bên), chữ sáng màu.

Góc dưới: Tên tác giả/đơn vị và nút "Xem X hình ảnh hoạt động".

Tương tác lật trang: Có 2 nút mũi tên mờ (< >) ở 2 mép mép sổ.

3.3. Modal Xem Ảnh (Photo Gallery)

Khi bấm "Xem hình ảnh hoạt động", màn hình tối lại (backdrop đen 95%).

Album ảnh hiện ra dưới dạng một băng chuyền (Carousel/Slider) trượt ngang.

Người dùng có thể vuốt (trên điện thoại) hoặc dùng chuột kéo để xem tối đa 5 bức ảnh kích thước lớn. Nút [X] ở góc phải trên để đóng.

3.4. Giao diện Viết Sổ (Input Form)

Trải nghiệm: Khi bấm "Viết trang mới", một trang giấy màu kem #F4F1E1 trượt đè lên trang hiện tại (hoặc hiện bên phải trên PC).

Form điền thông tin tối giản:

Input: Họ và tên.

Textarea: Khung soạn thảo văn bản rộng rãi.

Khu vực Upload Ảnh: Gồm các ô text để dán Link Google Drive (Link ảnh nền + Link ảnh hoạt động).

Nút gửi: Nút to, màu Đỏ Cherry, chữ Vàng Bơ: "Gửi lưu bút".

3.5. Tính năng Mục lục & Tìm kiếm (Table of Contents Drawer)

Vị trí: Nút "Mục lục" nằm ở góc trên bên phải giao diện sổ.

Hiển thị: Một ngăn kéo (Sidebar/Drawer) trượt ra từ lề phải màn hình.

Thành phần:

Thanh tìm kiếm (Search bar) có icon kính lúp. Nhập text vào đây sổ sẽ lọc bài theo thời gian thực (Real-time filtering).

Danh sách các bài viết: Hiển thị dưới dạng các thẻ (Card) nhỏ gọn gồm Tiêu đề, Thời gian, Đơn vị và 1 dòng trích dẫn nội dung ngắn.

Tương tác: Bấm vào thẻ nào, Sidebar tự đóng lại và Sổ tự động lật (Jump) đến đúng trang chứa bài viết đó.

1. CHIẾN LƯỢC THÍCH ỨNG ĐA MÀN HÌNH (RESPONSIVE)

Tính năng quan trọng nhất để ứng dụng sử dụng thực tế.

Trên Máy tính (Desktop/Laptop - Màn hình ngang):

Hiển thị sổ mở bung 2 mặt trang (Trang Trái và Trang Phải).

Hiệu ứng gáy sách (đổ bóng lõm) ở chính giữa màn hình.

Lật 1 lần qua 2 bài viết.

Nút chức năng nằm gọn gàng ở góc trên lề phải bên ngoài cuốn sổ.

Trên Điện thoại (Mobile - Màn hình dọc):

Chỉ hiển thị 1 mặt trang giấy để tối ưu diện tích (chữ không bị quá nhỏ).

Loại bỏ bóng đổ gáy sách.

Trải nghiệm lật trang giống như xem Story trên Facebook/Instagram/Tiktok (Lật từng trang một).

Các nút bấm (Mục lục, Viết sổ, Gập sổ) được thu nhỏ lại, sắp xếp dàn hàng ngang ngay trên nắp cuốn sổ cho dễ chạm bằng ngón cái.
