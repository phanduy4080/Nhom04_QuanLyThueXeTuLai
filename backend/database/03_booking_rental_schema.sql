-- =====================================================================
-- 03_booking_rental_schema.sql : Bảng Quản Lý Đơn Đặt Xe & Bàn Giao
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS booking;
CREATE SCHEMA IF NOT EXISTS rental;

-- Bảng Đơn đặt xe (booking.bookings)
CREATE TABLE IF NOT EXISTS booking.bookings (
    booking_id SERIAL PRIMARY KEY,
    booking_code VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NULL REFERENCES iam.users(user_id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    id_number VARCHAR(50) NULL,
    license_number VARCHAR(50) NULL,
    vehicle_id INT NOT NULL REFERENCES fleet.vehicles(vehicle_id),
    pickup_branch_id INT NOT NULL REFERENCES org.branches(branch_id),
    return_branch_id INT NOT NULL REFERENCES org.branches(branch_id),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    total_days INT NOT NULL DEFAULT 1,
    daily_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    deposit_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    insurance_fee NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(50) NOT NULL DEFAULT 'BANK_TRANSFER',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'UNPAID',
    notes TEXT NULL,
    approved_by INT NULL REFERENCES iam.users(user_id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bảng Biên bản bàn giao xe (rental.handover_records)
CREATE TABLE IF NOT EXISTS rental.handover_records (
    handover_id SERIAL PRIMARY KEY,
    handover_code VARCHAR(50) UNIQUE NOT NULL,
    booking_id INT NOT NULL REFERENCES booking.bookings(booking_id) ON DELETE CASCADE,
    vehicle_id INT NOT NULL REFERENCES fleet.vehicles(vehicle_id),
    staff_id INT NULL REFERENCES iam.users(user_id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'CHECKOUT',
    odo_meter INT NOT NULL DEFAULT 0,
    fuel_level VARCHAR(50) NOT NULL DEFAULT '100%',
    car_condition TEXT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dữ liệu mẫu khởi tạo cho Bookings
INSERT INTO booking.bookings (
    booking_code, customer_name, phone, email, id_number, license_number,
    vehicle_id, pickup_branch_id, return_branch_id, start_date, end_date,
    total_days, daily_price, total_amount, deposit_amount, status, payment_method, payment_status, notes
) VALUES
(
    'DH-2610-000042', 'Nguyễn Văn An', '0901234567', 'an.nguyen@gmail.com', '079090001234', 'GPLX-B2-888999',
    1, 1, 1, NOW() + INTERVAL '2 days', NOW() + INTERVAL '5 days',
    3, 1200000, 3600000, 10000000, 'PENDING', 'BANK_TRANSFER', 'PAID_DEPOSIT', 'Nhận xe tại sảnh ga T2 Tân Sơn Nhất'
),
(
    'DH-2610-000041', 'Trần Thị Bích', '0912345678', 'bich.tran@gmail.com', '079090005678', 'GPLX-B2-777666',
    2, 1, 1, NOW() + INTERVAL '1 days', NOW() + INTERVAL '3 days',
    2, 850000, 1700000, 8000000, 'CONFIRMED', 'BANK_TRANSFER', 'PAID_DEPOSIT', 'Cần chuẩn bị ghế trẻ em'
),
(
    'DH-2610-000040', 'Lê Hoàng Long', '0987654321', 'long.le@gmail.com', '079090009999', 'GPLX-B2-555444',
    3, 2, 2, NOW() - INTERVAL '1 days', NOW() + INTERVAL '2 days',
    3, 1500000, 4500000, 15000000, 'IN_RENTAL', 'BANK_TRANSFER', 'FULLY_PAID', 'Đang sử dụng xe'
)
ON CONFLICT (booking_code) DO NOTHING;
