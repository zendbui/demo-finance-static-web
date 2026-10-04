# Website Bộ môn Ngân hàng – Tài chính – Kế toán

Website tĩnh (HTML/CSS/JS thuần, không cần build) dùng để đăng thông tin môn học, tài liệu/link tham khảo,
bài làm tốt của các khoá, tin tuyển dụng và cuộc thi. Thiết kế để host miễn phí trên **GitHub Pages**.

## Cấu trúc thư mục

```
├── index.html            Trang chủ
├── mon-hoc.html           Danh sách môn học (tài liệu, link, bài làm tốt theo môn)
├── bai-lam-tot.html       Tổng hợp bài làm tốt của tất cả môn học
├── tuyen-dung.html        Tin tuyển dụng tổng hợp từ nhiều nguồn
├── cuoc-thi.html          Cuộc thi do khoa/trường/bên ngoài tổ chức
├── 404.html               Trang lỗi khi không tìm thấy đường dẫn
├── assets/
│   ├── css/style.css      Toàn bộ giao diện
│   ├── js/common.js       Hàm dùng chung (fetch JSON, tạo DOM an toàn, nav mobile...)
│   ├── js/page-*.js       Script riêng cho từng trang
│   └── img/favicon.svg
├── data/
│   ├── courses.json       Danh sách môn học + tài liệu/link/bài làm tốt
│   ├── jobs.json          Tin tuyển dụng
│   └── competitions.json  Cuộc thi
└── files/                 (tự tạo) nơi đặt file PDF/tài liệu nếu muốn host trực tiếp trên repo
```

## Cách cập nhật nội dung

Toàn bộ nội dung nằm trong 3 file JSON ở thư mục `data/` — **không cần sửa HTML/CSS/JS**.

### 1. Thêm/sửa môn học — `data/courses.json`

```json
{
  "id": "fin101",
  "code": "TCNH101",
  "name": "Tên môn học",
  "credits": 3,
  "semester": "Học kỳ 1",
  "description": "Mô tả ngắn gọn môn học.",
  "references": [
    { "title": "Tên giáo trình/tài liệu", "link": "files/ten-file.pdf" }
  ],
  "links": [
    { "title": "Tên trang/nguồn tham khảo", "url": "https://..." }
  ],
  "showcases": [
    { "title": "Tên bài làm", "student": "Họ tên sinh viên", "cohort": "K45", "url": "https://... hoặc link Google Drive" }
  ]
}
```

- `references[].link` có thể là link ngoài, hoặc đường dẫn tới file đặt trong thư mục `files/` (tự tạo trong repo, ví dụ `files/giao-trinh-abc.pdf`).
- `showcases[].url` nên trỏ tới bản PDF/Google Drive/Slide công khai của bài làm (xin phép sinh viên trước khi đăng).
- Bỏ trống mảng `[]` nếu chưa có dữ liệu — trang sẽ tự hiển thị "Chưa có dữ liệu, sẽ cập nhật sau."

### 2. Thêm tin tuyển dụng — `data/jobs.json`

```json
{
  "title": "Tên vị trí",
  "company": "Tên công ty/ngân hàng",
  "source": "Tên nguồn (VietnamWorks, TopCV, Fanpage Khoa...)",
  "url": "Link tới bài đăng gốc",
  "sourceUrl": "Link trang nguồn (dự phòng nếu url hết hạn)",
  "location": "Tỉnh/thành",
  "postedDate": "YYYY-MM-DD",
  "deadline": "YYYY-MM-DD",
  "tags": ["Ngân hàng", "Entry level"]
}
```

- Vì đây là site tĩnh (không có máy chủ), **tin tuyển dụng phải được người quản trị tổng hợp và nhập thủ công**
  từ các nguồn (VietnamWorks, TopCV, CareerBuilder, LinkedIn, fanpage các ngân hàng/công ty...) rồi dán vào file này.
  Luôn ghi rõ `source` và `url` trỏ về bài đăng gốc để sinh viên kiểm chứng thông tin.
- Trang Tuyển dụng tự động: lọc tin đã hết hạn (theo `deadline`), gắn nhãn "còn N ngày" khi gần hết hạn.
- Dữ liệu mẫu hiện tại trong repo là **nội dung minh hoạ** (ví dụ) để demo giao diện, cần thay bằng tin thật trước khi công bố.

### 3. Thêm cuộc thi — `data/competitions.json`

```json
{
  "name": "Tên cuộc thi",
  "organizer": "Đơn vị tổ chức",
  "description": "Mô tả ngắn.",
  "url": "Link thông tin/đăng ký",
  "startDate": "YYYY-MM-DD",
  "deadline": "YYYY-MM-DD"
}
```

Trạng thái (Sắp diễn ra / Đang diễn ra / Đã kết thúc) được **tự động tính** theo ngày hiện tại so với `startDate`/`deadline`, không cần cập nhật tay.

## Chạy thử ở máy local

Trình duyệt chặn `fetch()` đọc file JSON khi mở trực tiếp bằng đường dẫn `file://`. Hãy chạy một server tĩnh đơn giản:

```bash
# Python (có sẵn trên macOS)
python3 -m http.server 8000

# hoặc Node.js
npx serve .
```

Sau đó mở `http://localhost:8000`.

## Deploy lên GitHub Pages

1. Tạo repository mới trên GitHub, rồi đẩy toàn bộ thư mục này lên:
   ```bash
   git init
   git add .
   git commit -m "Khởi tạo website Bộ môn NH-TC-KT"
   git branch -M main
   git remote add origin https://github.com/<ten-to-chuc-hoac-ca-nhan>/<ten-repo>.git
   git push -u origin main
   ```
2. Vào repo trên GitHub → **Settings → Pages**.
3. Ở mục **Build and deployment**, chọn **Source: Deploy from a branch**, **Branch: main**, thư mục **/ (root)** → **Save**.
4. Sau 1–2 phút, trang sẽ có địa chỉ dạng `https://<ten-to-chuc-hoac-ca-nhan>.github.io/<ten-repo>/`.

File `.nojekyll` đã có sẵn trong repo để GitHub Pages phục vụ file tĩnh trực tiếp, không qua xử lý Jekyll.

## Ghi chú

- Không cần framework/build step — chỉ HTML, CSS, JavaScript thuần nên dễ bảo trì cho người không chuyên code.
- Toàn bộ nội dung hiển thị được dựng qua DOM API (`textContent`, không dùng `innerHTML` với dữ liệu động) để tránh rủi ro chèn mã độc (XSS) từ dữ liệu tổng hợp bên ngoài.
- Trước khi công bố chính thức, hãy thay toàn bộ nội dung mẫu (môn học, tin tuyển dụng, cuộc thi, thông tin liên hệ ở footer) bằng thông tin thật của Bộ môn.
