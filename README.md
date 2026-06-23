# MiniMart POS - Hệ thống Quản lý Siêu thị
Dự án phần mềm quản lý siêu thị MiniMart bao gồm hệ thống Bán hàng tại quầy (POS), quản lý kho, và trang đặt hàng trực tuyến (Storefront).

---

## 🛠 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN (DÀNH CHO MÁY MỚI)

Website này được xây dựng bằng **Laravel Framework (PHP)** và **MySQL**. Bạn **KHÔNG THỂ** chạy dự án bằng cách nhấp đúp vào các file `.html` (hiện `file:///...`). Bạn bắt buộc phải bật máy chủ ảo theo các bước sau:

### Bước 1: Cài đặt công cụ môi trường
Đảm bảo máy tính của bạn đã cài đặt các phần mềm sau:
- **Laragon** hoặc **XAMPP** (để có PHP và MySQL).
- **Composer** (Trình quản lý thư viện của PHP).

### Bước 2: Tải Source Code & Cài đặt thư viện
1. Mở Terminal (hoặc CMD/PowerShell).
2. Di chuyển vào thư mục chứa code vừa tải về (ví dụ: `cd C:\laragon\www\sieuthimini-main`).
3. Gõ lệnh sau để tải toàn bộ thư viện cần thiết (bước này rất quan trọng vì Github mặc định không lưu thư mục `vendor`):
   ```bash
   composer install
   ```

### Bước 3: Cấu hình File Môi trường (.env)
1. Trong thư mục code, copy file `.env.example` và đổi tên thành `.env` (hoặc chạy lệnh: `cp .env.example .env`).
2. Sinh khóa bảo mật cho dự án bằng lệnh:
   ```bash
   php artisan key:generate
   ```

### Bước 4: Khôi phục Cơ sở dữ liệu (Database)
1. Mở phần mềm Laragon/XAMPP, ấn **Start** Apache và MySQL.
2. Mở phpMyAdmin (hoặc HeidiSQL), tạo một Database rỗng tên là: `minimart_db`.
3. Có 2 cách để nạp dữ liệu:
   - **Cách 1 (Dùng file Backup gốc):** Import file `database/minimart_db_backup.sql` trực tiếp vào Database vừa tạo.
   - **Cách 2 (Dùng lệnh Laravel):** Chạy lệnh `php artisan migrate:fresh --seed` ở Terminal.

### Bước 5: Khởi động Máy chủ và Trải nghiệm
1. Tại màn hình Terminal, gõ lệnh khởi động máy chủ:
   ```bash
   php artisan serve
   ```
2. Mở trình duyệt Web (Chrome, Edge...) và truy cập chính xác vào các đường link sau:
   - **Trang dành cho khách hàng:** 👉 `http://127.0.0.1:8000/store.html`
   - **Trang quản trị (POS):** 👉 `http://127.0.0.1:8000/dashboard.html`

### 🔑 Thông tin Đăng nhập Quản trị (Admin)
- **Tên đăng nhập (Email):** `admin@gmail.com`
- **Mật khẩu:** `123456`
