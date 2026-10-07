# 📘 HƯỚNG DẪN KẾT NỐI VÀ KHỞI TẠO CSDL (DATABASE SETUP GUIDE)
**Dự án:** Hệ Thống Quản Lý & Cho Thuê Xe Tự Lái (AutoRental - Nhóm 04)  
**Công nghệ CSDL:** PostgreSQL 16 + Prisma ORM

---

## 📌 1. Thông Tin Kết Nối Mặc Định (Database Credentials)

Khi cấu hình môi trường cho Backend NestJS, các thông số mặc định như sau:

| Thông số | Giá trị mặc định | Chú thích |
| :--- | :--- | :--- |
| **Host** | `localhost` | Hoặc `127.0.0.1` |
| **Port** | `5432` | Cổng mặc định của PostgreSQL |
| **Database Name** | `autorental_db` | Tên cơ sở dữ liệu |
| **Username** | `postgres` | Tài khoản quản trị DB |
| **Password** | `postgrespassword` | Mật khẩu DB |
| **Prisma Connection URL** | `postgresql://postgres:postgrespassword@localhost:5432/autorental_db?schema=public` | Khai báo trong `backend/.env` |

---

## 🐳 CÁCH 1: KẾT NỐI VÀ CHẠY DATABASE BẰNG DOCKER (Khuyên Dùng)

> [!TIP]
> **Ưu điểm**: Nhanh chóng, tự động nạp toàn bộ Schema và Dữ liệu mẫu (Seed Data) ngay khi vừa khởi động mà không cần cài đặt PostgreSQL lên máy tính.

### Bước 1: Chuẩn bị
- Đảm bảo máy tính đã cài đặt và đang mở ứng dụng **Docker Desktop**.

### Bước 2: Khởi động Database Container
Mở terminal tại thư mục gốc của dự án (`Nhom04_QuanLyThueXeTuLai`) và chạy lệnh:

```bash
# Khởi động chỉ riêng service PostgreSQL chạy ngầm
docker compose up -d postgres
```

*(Hoặc nếu muốn chạy toàn bộ hệ thống gồm Postgres + Backend + Frontend qua Docker:)*
```bash
docker compose up -d --build
```

### Bước 3: Cơ chế tự động nạp dữ liệu (Auto Seed)
Khi container `autorental_postgres` khởi tạo lần đầu, Docker sẽ tự động chạy toàn bộ các file script trong thư mục `backend/database/` theo thứ tự:
1. `00_init.sql`: Tạo các extensions và schemas (`iam`, `org`, `fleet`, `pricing`, `booking`, `rental`, `core`).
2. `01a_schema_master.sql`: Tạo toàn bộ cấu trúc bảng, khóa ngoại, indexes và triggers.
3. `02_seed_initial_data.sql`: Nạp tài khoản, chi nhánh, dòng xe, xe thực tế, bảng giá.
4. `03_booking_rental_schema.sql`: Nạp cấu trúc bảng đơn đặt xe và biên bản bàn giao xe.

### Bước 4: Kiểm tra trạng thái Container
```bash
# Xem danh sách container đang chạy
docker ps

# Xem logs của PostgreSQL
docker logs -f autorental_postgres
```

### Bước 5: Các thao tác quản lý Docker hữu ích
- **Dừng Database:**
  ```bash
  docker compose stop postgres
  ```
- **Khởi động lại Database:**
  ```bash
  docker compose start postgres
  ```
- **Xóa sạch dữ liệu và nạp lại từ đầu (Reset Database):**
  ```bash
  docker compose down -v
  docker compose up -d postgres
  ```

---

## 💻 CÁCH 2: KẾT NỐI DATABASE THEO CÁCH TRUYỀN THỐNG (Cài Đặt Trực Tiếp Trên Máy)

> [!NOTE]
> Sử dụng cách này nếu bạn không muốn dùng Docker và muốn quản lý trực tiếp bằng PostgreSQL cài cục bộ trên macOS / Windows / Linux.

### Bước 1: Cài đặt PostgreSQL trên máy tính
- **Trên macOS (dùng Homebrew):**
  ```bash
  brew install postgresql@16
  brew services start postgresql@16
  ```
- **Trên Windows / Linux:**
  - Tải bộ cài đặt chính thức tại: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
  - Cài đặt và đặt mật khẩu cho user `postgres` (ví dụ: `postgrespassword` hoặc mật khẩu tùy chọn của bạn).

---

### Bước 2: Tạo Database `autorental_db`

Bạn có thể tạo qua công cụ dòng lệnh hoặc qua giao diện đồ họa GUI:

#### Cách 2.1: Bằng dòng lệnh (CLI - psql)
```bash
# Đăng nhập vào postgres
psql -U postgres

# Tạo database mới
CREATE DATABASE autorental_db;

# Thoát psql
\q
```

#### Cách 2.2: Bằng ứng dụng quản lý GUI (DBeaver / Navicat / pgAdmin / TablePlus)
1. Mở công cụ quản lý GUI (ví dụ **DBeaver** hoặc **pgAdmin**).
2. Tạo kết nối mới (New Connection) tới **PostgreSQL**:
   - Host: `localhost`
   - Port: `5432`
   - User: `postgres`
   - Password: `<mật_khẩu_của_bạn>`
3. Click chuột phải chọn **Create Database** -> Đặt tên: `autorental_db`.

---

### Bước 3: Nạp Schema & Dữ Liệu Mẫu (Import SQL)

Tại thư mục dự án, chạy lệnh import toàn bộ dữ liệu qua script tổng hợp `init_all.sql`:

```bash
# Di chuyển vào thư mục database
cd backend/database

# Chạy import toàn bộ dữ liệu vào database autorental_db
psql -U postgres -d autorental_db -f init_all.sql
```

*(Nếu dùng phần mềm GUI như DBeaver: Mở file `backend/database/00_init.sql`, `01a_schema_master.sql`, `02_seed_initial_data.sql`, `03_booking_rental_schema.sql` và nhấn **Execute SQL Script** lần lượt theo thứ tự).*

---

### Bước 4: Cập nhật biến môi trường Backend

Mở file `backend/.env` và cập nhật lại chuỗi kết nối `DATABASE_URL` theo đúng mật khẩu và cổng máy bạn:

```env
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/autorental_db?schema=public"
```

*Ví dụ:*
```env
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/autorental_db?schema=public"
```

---

## ⚡ 3. Đồng Bộ Với Prisma ORM & Khởi Động Ứng Dụng

Sau khi CSDL đã sẵn sàng (theo Cách 1 hoặc Cách 2), thực hiện các bước sau để Backend và Frontend nhận diện CSDL:

```bash
# 1. Di chuyển vào thư mục backend
cd backend

# 2. Tạo Prisma Client từ schema
npx prisma generate

# 3. (Tùy chọn) Mở giao diện trực quan Prisma Studio để xem dữ liệu trên trình duyệt
npx prisma studio
# Truy cập: http://localhost:5555
```

Khởi chạy Backend và Frontend ở chế độ phát triển:
```bash
# Chạy Backend (Terminal 1)
cd backend
npm run start:dev

# Chạy Frontend (Terminal 2)
cd frontend
npm run dev
```

---

## 🔑 4. Tài Khoản Kiểm Thử Mặc Định (Demo Accounts)

Hệ thống đã chuẩn bị sẵn các tài khoản mẫu trong dữ liệu Seed:

| Quyền | Email đăng nhập | Mật khẩu | Chức năng truy cập |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@autorental.vn` | `Admin@123` | Toàn quyền Dashboard, Duyệt cọc, Bàn giao xe, Quản lý xe, Quản lý tài khoản |
| **Khách hàng 1 (Customer)** | `nguyenvana@gmail.com` | `User@123` | Đặt xe, xem chi tiết hợp đồng, lịch sử thuê |
| **Khách hàng 2 (Customer)** | `tranthib@gmail.com` | `User@123` | Đặt xe, xem chi tiết hợp đồng |

---

## 🛠️ 5. Xử Lý Các Lỗi Thường Gặp (Troubleshooting)

### Lỗi 1: `Port 5432 is already in use`
- **Nguyên nhân:** Đang có một tiến trình PostgreSQL cài trực tiếp chiếm cổng 5432 khi bạn cố khởi chạy Docker.
- **Giải pháp:**
  - Tắt service PostgreSQL local:
    - Trên macOS: `brew services stop postgresql@16`
    - Trên Windows: Mở *Services.msc* -> tìm `postgresql` -> click chuột phải chọn **Stop**.
  - Hoặc đổi cổng ngoài trong `docker-compose.yml` thành `"5433:5432"` và cập nhật port trong `backend/.env`.

### Lỗi 2: `password authentication failed for user "postgres"`
- **Nguyên nhân:** Mật khẩu trong `backend/.env` không khớp với mật khẩu thực tế của PostgreSQL.
- **Giải pháp:** Kiểm tra lại mật khẩu bạn đã thiết lập khi cài đặt PostgreSQL hoặc đặt lại trong file `.env`.

### Lỗi 3: `The table 'booking.bookings' does not exist`
- **Nguyên nhân:** Chưa chạy file script `03_booking_rental_schema.sql`.
- **Giải pháp:** Chạy file `backend/database/03_booking_rental_schema.sql` vào database `autorental_db` rồi chạy `npx prisma generate` trong thư mục `backend`.
