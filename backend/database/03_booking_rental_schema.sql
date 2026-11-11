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
    identity_verified BOOLEAN DEFAULT FALSE,
    id_card_front TEXT NULL,
    id_card_back TEXT NULL,
    license_front TEXT NULL,
    license_back TEXT NULL,
    driver_dob DATE NULL,
    license_expiry DATE NULL,
    license_class VARCHAR(20) DEFAULT 'B2',
    verification_status VARCHAR(50) DEFAULT 'PENDING',
    eligibility_result JSONB NULL,
    has_additional_driver BOOLEAN DEFAULT FALSE,
    additional_driver_name VARCHAR(255) NULL,
    additional_driver_phone VARCHAR(50) NULL,
    additional_driver_email VARCHAR(255) NULL,
    additional_driver_id_number VARCHAR(50) NULL,
    additional_driver_dob DATE NULL,
    additional_driver_license_number VARCHAR(50) NULL,
    additional_driver_license_class VARCHAR(20) NULL,
    additional_driver_license_expiry DATE NULL,
    additional_driver_license_front TEXT NULL,
    additional_driver_license_back TEXT NULL,
    additional_driver_eligibility JSONB NULL,
    additional_driver_fee NUMERIC(15, 2) DEFAULT 0,
    contract_number VARCHAR(50) NULL,
    contract_created_at TIMESTAMPTZ NULL,
    contract_signed_at TIMESTAMPTZ NULL,
    contract_terms JSONB NULL,
    deposit_paid_at TIMESTAMPTZ NULL,
    deposit_transaction_ref VARCHAR(100) NULL,
    rejection_reason TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bảng Biên bản bàn giao & hoàn trả xe (rental.handover_records - Sprint 5: Giao xe, Sprint 8 & 9: Trả xe & Phạt vi phạm)
CREATE TABLE IF NOT EXISTS rental.handover_records (
    handover_id SERIAL PRIMARY KEY,
    handover_code VARCHAR(50) UNIQUE NOT NULL,
    booking_id INT NOT NULL REFERENCES booking.bookings(booking_id) ON DELETE CASCADE,
    vehicle_id INT NOT NULL REFERENCES fleet.vehicles(vehicle_id),
    staff_id INT NULL REFERENCES iam.users(user_id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'CHECKOUT', -- CHECKOUT (Giao xe), CHECKIN (Trả xe)
    odo_meter INT NOT NULL DEFAULT 0,
    fuel_level VARCHAR(50) NOT NULL DEFAULT '100%',
    car_condition TEXT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    checkout_id INT NULL REFERENCES rental.handover_records(handover_id) ON DELETE SET NULL,
    actual_return_time TIMESTAMPTZ NULL,
    excess_km INT NOT NULL DEFAULT 0,
    excess_km_fee NUMERIC(15, 2) NOT NULL DEFAULT 0,
    late_hours INT NOT NULL DEFAULT 0,
    late_fee NUMERIC(15, 2) NOT NULL DEFAULT 0,
    fuel_shortage_fee NUMERIC(15, 2) NOT NULL DEFAULT 0,
    cleaning_fee NUMERIC(15, 2) NOT NULL DEFAULT 0,
    new_damages TEXT NULL,
    new_damages_fee NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_penalty_fee NUMERIC(15, 2) NOT NULL DEFAULT 0,
    is_disputed BOOLEAN NOT NULL DEFAULT FALSE,
    dispute_reason TEXT NULL,
    inspection_photos JSONB DEFAULT '[]'::jsonb,
    notes TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bảng Quyết toán hợp đồng & Cấn trừ cọc (rental.settlements - Sprint 10: US-24, US-25)
CREATE TABLE IF NOT EXISTS rental.settlements (
    settlement_id SERIAL PRIMARY KEY,
    settlement_code VARCHAR(50) UNIQUE NOT NULL,
    booking_id INT NOT NULL REFERENCES booking.bookings(booking_id) ON DELETE CASCADE,
    handover_id INT NULL REFERENCES rental.handover_records(handover_id) ON DELETE SET NULL,
    total_rental_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    total_penalties NUMERIC(15,2) NOT NULL DEFAULT 0,
    damage_compensation NUMERIC(15,2) NOT NULL DEFAULT 0,
    total_payable NUMERIC(15,2) NOT NULL DEFAULT 0,
    deposit_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    refund_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    additional_charge NUMERIC(15,2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(50) DEFAULT 'BANK_TRANSFER',
    settlement_status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    notes TEXT,
    settled_by BIGINT NULL REFERENCES iam.users(user_id) ON DELETE SET NULL,
    settled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_settlements_booking ON rental.settlements(booking_id);

-- Bảng Yêu cầu gia hạn thuê xe (booking.rental_extensions - Sprint 6: US-16, US-17)
CREATE TABLE IF NOT EXISTS booking.rental_extensions (
    extension_id SERIAL PRIMARY KEY,
    extension_code VARCHAR(50) UNIQUE NOT NULL,
    booking_id INT NOT NULL REFERENCES booking.bookings(booking_id) ON DELETE CASCADE,
    current_end_date TIMESTAMPTZ NOT NULL,
    new_end_date TIMESTAMPTZ NOT NULL,
    extended_days INT NOT NULL DEFAULT 1,
    daily_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    extra_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    reason TEXT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    system_decision VARCHAR(50) NULL,
    system_notes TEXT NULL,
    reviewed_by BIGINT NULL REFERENCES iam.users(user_id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bảng Quản lý sự cố & Bồi thường bảo hiểm (incident.incidents - Sprint 7: US-18, US-19)
CREATE TABLE IF NOT EXISTS incident.incidents (
    incident_id BIGSERIAL PRIMARY KEY,
    incident_code VARCHAR(50) UNIQUE NOT NULL,
    booking_id INT NOT NULL REFERENCES booking.bookings(booking_id) ON DELETE CASCADE,
    vehicle_id BIGINT NOT NULL REFERENCES fleet.vehicles(vehicle_id) ON DELETE CASCADE,
    incident_type incident.incident_type NOT NULL DEFAULT 'OTHER',
    status incident.incident_status NOT NULL DEFAULT 'REPORTED',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    contact_phone VARCHAR(50),
    evidence_photos JSONB DEFAULT '[]'::jsonb,
    insurance_claim_number VARCHAR(100),
    insurer_name VARCHAR(150),
    insurance_appraiser VARCHAR(100),
    insurance_contact VARCHAR(50),
    insurance_status VARCHAR(50) DEFAULT 'NOT_SUBMITTED',
    insurance_notes TEXT,
    total_damage_cost NUMERIC(15,2) DEFAULT 0,
    insurance_coverage_amount NUMERIC(15,2) DEFAULT 0,
    company_share_amount NUMERIC(15,2) DEFAULT 0,
    customer_share_amount NUMERIC(15,2) DEFAULT 0,
    deducted_from_deposit NUMERIC(15,2) DEFAULT 0,
    customer_payment_status VARCHAR(50) DEFAULT 'PENDING',
    liability_party incident.liable_party DEFAULT 'CUSTOMER',
    liability_notes TEXT,
    resolution_notes TEXT,
    reported_by_name VARCHAR(100),
    reported_by_phone VARCHAR(50),
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_staff_id BIGINT REFERENCES iam.users(user_id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_incidents_booking ON incident.incidents(booking_id);
CREATE INDEX IF NOT EXISTS ix_incidents_vehicle ON incident.incidents(vehicle_id);
CREATE INDEX IF NOT EXISTS ix_incidents_status ON incident.incidents(status);

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
