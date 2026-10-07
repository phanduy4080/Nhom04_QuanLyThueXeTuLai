-- =====================================================================
--  02_seed_initial_data.sql : Dữ liệu mẫu (Master Data & Demo Data)
-- =====================================================================

-- 1. Cấu hình hệ thống (core.settings)
INSERT INTO core.settings (setting_key, value, value_type, description)
VALUES 
  ('SYSTEM_NAME', 'QuickHatch Car Rental', 'string', 'Tên hệ thống cho thuê xe tự lái'),
  ('DEFAULT_VAT_PERCENT', '10', 'numeric', 'Thuế giá trị gia tăng (%)'),
  ('HOLD_EXPIRY_MINUTES', '30', 'int', 'Thời gian giữ chỗ xe trước khi hủy cọc'),
  ('AUTO_APPROVE_LOW_RISK', 'true', 'bool', 'Tự động duyệt hồ sơ khách rủi ro thấp')
ON CONFLICT (setting_key) DO NOTHING;

-- 2. Quyền và vai trò (iam.roles, iam.permissions)
INSERT INTO iam.roles (code, name, description, is_system)
VALUES 
  ('ADMIN', 'Quản Trị Viên', 'Toàn quyền quản trị hệ thống', true),
  ('MANAGER', 'Quản Lý Chi Nhánh', 'Quản lý xe, duyệt lịch và xem doanh thu', true),
  ('STAFF', 'Nhân Viên Bàn Giao', 'Bàn giao xe, kiểm tra xe nhận/trả', true),
  ('ACCOUNTANT', 'Kế Toán', 'Quản lý thu chi và hóa đơn', true),
  ('CUSTOMER', 'Khách Hàng', 'Khách thuê xe', true)
ON CONFLICT (code) DO NOTHING;

-- 3. Chi nhánh mẫu (org.branches)
INSERT INTO org.branches (code, name, address_line, ward, district, province, phone, email)
VALUES 
  ('CN_SGN_01', 'Chi Nhánh Sân Bay Tân Sơn Nhất', '45 Trường Sơn', 'Phường 2', 'Tân Bình', 'Hồ Chí Minh', '02838485555', 'sgn@quickhatch.vn'),
  ('CN_SGN_02', 'Chi Nhánh Quận 1 - Trung Tâm', '12 Lê Duẩn', 'Bến Nghé', 'Quận 1', 'Hồ Chí Minh', '02838221122', 'q1@quickhatch.vn'),
  ('CN_HAN_01', 'Chi Nhánh Sân Bay Nội Bài', 'Ga T1 Sân Bay Nội Bài', 'Phú Minh', 'Sóc Sơn', 'Hà Nội', '02438865555', 'han@quickhatch.vn')
ON CONFLICT (code) DO NOTHING;

-- 4. Hạng bằng lái (crm.license_classes)
INSERT INTO crm.license_classes (code, description, max_seats, min_age)
VALUES 
  ('B1', 'Ô tô số tự động chở người đến 9 chỗ', 9, 18),
  ('B2', 'Ô tô số sàn & tự động chở người đến 9 chỗ, tải < 3.5T', 9, 18),
  ('C', 'Ô tô tải trên 3.5 tấn', 9, 21),
  ('D', 'Ô tô chở người từ 10 đến 30 chỗ', 30, 24)
ON CONFLICT (code) DO NOTHING;

-- 5. Danh mục xe (fleet.vehicle_categories)
INSERT INTO fleet.vehicle_categories (code, name, description, required_license_classes, sort_order)
VALUES 
  ('SEDAN', 'Sedan 4-5 chỗ', 'Xe du lịch đô thị êm ái, tiết kiệm nhiên liệu', '{B1,B2}', 1),
  ('SUV', 'SUV / Crossover 5-7 chỗ', 'Gầm cao đa dụng, mạnh mẽ, vượt địa hình tốt', '{B1,B2}', 2),
  ('MPV', 'MPV 7 chỗ gia đình', 'Khoang lái rộng rãi, phù hợp du lịch gia đình', '{B1,B2}', 3),
  ('EV', 'Xe Điện (Electric Vehicle)', 'Xe điện thân thiện môi trường, chi phí vận hành siêu rẻ', '{B1,B2}', 4)
ON CONFLICT (code) DO NOTHING;

-- 6. Hãng xe (fleet.brands)
INSERT INTO fleet.brands (name, country)
VALUES 
  ('VinFast', 'Việt Nam'),
  ('Toyota', 'Nhật Bản'),
  ('Mazda', 'Nhật Bản'),
  ('Hyundai', 'Hàn Quốc'),
  ('Mitsubishi', 'Nhật Bản'),
  ('Ford', 'Mỹ'),
  ('Mercedes-Benz', 'Đức')
ON CONFLICT (name) DO NOTHING;

-- 7. Chính sách thuê mặc định (pricing.rental_policies)
INSERT INTO pricing.rental_policies (code, name, description, min_driver_age, min_license_years, late_fee_percent_per_hour, extra_km_fee, cleaning_fee)
VALUES 
  ('STANDARD_2026', 'Chính Sách Thuê Chuẩn QuickHatch', 'Áp dụng cho toàn bộ xe du lịch tự lái thông thường', 21, 1.0, 10.0, 5000, 200000)
ON CONFLICT (code) DO NOTHING;

-- 8. Tài khoản người dùng mẫu (iam.users) - Mật khẩu mẫu: 123456 (hash bcrypt: $2b$10$wT.fG6/...)
INSERT INTO iam.users (user_type, email, phone, password_hash, status)
VALUES 
  ('STAFF', 'admin@quickhatch.vn', '0900000001', '$2b$10$ep/0K0YfL/v5sF9j7tM.p.HwQ5eA8UqJkM1hWcWqL7mPnXvI5eZ2S', 'ACTIVE'),
  ('STAFF', 'nhanvien@quickhatch.vn', '0900000002', '$2b$10$ep/0K0YfL/v5sF9j7tM.p.HwQ5eA8UqJkM1hWcWqL7mPnXvI5eZ2S', 'ACTIVE'),
  ('CUSTOMER', 'khachhang@quickhatch.vn', '0901234567', '$2b$10$ep/0K0YfL/v5sF9j7tM.p.HwQ5eA8UqJkM1hWcWqL7mPnXvI5eZ2S', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- Gán vai trò cho Admin & Customer
INSERT INTO iam.user_roles (user_id, role_id)
SELECT u.user_id, r.role_id 
FROM iam.users u, iam.roles r 
WHERE (u.email = 'admin@quickhatch.vn' AND r.code = 'ADMIN')
   OR (u.email = 'nhanvien@quickhatch.vn' AND r.code = 'STAFF')
   OR (u.email = 'khachhang@quickhatch.vn' AND r.code = 'CUSTOMER')
ON CONFLICT DO NOTHING;

-- Nhân viên (iam.staff)
INSERT INTO iam.staff (user_id, staff_code, full_name, branch_id, position)
SELECT u.user_id, 'NV-2601-000001', 'Trần Văn Quản Trị', 1, 'Trưởng chi nhánh'
FROM iam.users u WHERE u.email = 'admin@quickhatch.vn'
ON CONFLICT (user_id) DO NOTHING;

-- Khách hàng (crm.customers)
INSERT INTO crm.customers (user_id, customer_code, full_name, phone, email, verification_status)
SELECT u.user_id, 'KH-2601-000001', 'Nguyễn Văn Khách Hàng', '0901234567', 'khachhang@quickhatch.vn', 'VERIFIED'
FROM iam.users u WHERE u.email = 'khachhang@quickhatch.vn'
ON CONFLICT (user_id) DO NOTHING;

-- 9. Dòng xe mẫu (fleet.vehicle_models)
INSERT INTO fleet.vehicle_models (brand_id, category_id, name, variant, seats, transmission, fuel_type, battery_kwh, ev_range_km, fuel_consumption_l100km, launch_year)
VALUES 
  (1, 4, 'VinFast VF 8', 'Plus 2024', 5, 'AUTOMATIC', 'ELECTRIC', 87.7, 471, NULL, 2024),
  (1, 4, 'VinFast VF 3', 'Eco 2024', 4, 'AUTOMATIC', 'ELECTRIC', 18.6, 210, NULL, 2024),
  (2, 1, 'Toyota Vios', '1.5G CVT', 5, 'AUTOMATIC', 'GASOLINE', NULL, NULL, 5.8, 2023),
  (3, 2, 'Mazda CX-5', '2.0 Premium', 5, 'AUTOMATIC', 'GASOLINE', NULL, NULL, 7.2, 2024),
  (4, 2, 'Hyundai SantaFe', '2.5 Xăng Cao Cấp', 7, 'AUTOMATIC', 'GASOLINE', NULL, NULL, 8.5, 2023),
  (5, 3, 'Mitsubishi Xpander', '1.5 AT Premium', 7, 'AUTOMATIC', 'GASOLINE', NULL, NULL, 6.9, 2023)
ON CONFLICT DO NOTHING;

-- 10. Danh sách xe thực tế (fleet.vehicles)
INSERT INTO fleet.vehicles (license_plate, asset_code, model_id, manufacture_year, color, transmission, fuel_type, odometer_km, current_branch_id, status, list_price_per_day, deposit_amount)
VALUES 
  ('51K-888.88', 'XE-VF8-001', 1, 2024, 'Trắng Trân Châu', 'AUTOMATIC', 'ELECTRIC', 12500, 1, 'AVAILABLE', 1200000, 10000000),
  ('51K-999.99', 'XE-VF3-001', 2, 2024, 'Vàng Nắng', 'AUTOMATIC', 'ELECTRIC', 3200, 1, 'AVAILABLE', 450000, 5000000),
  ('51F-123.45', 'XE-VIOS-001', 3, 2023, 'Bạc', 'AUTOMATIC', 'GASOLINE', 45000, 2, 'AVAILABLE', 700000, 5000000),
  ('51H-678.90', 'XE-CX5-001', 4, 2024, 'Đỏ Pha Lê', 'AUTOMATIC', 'GASOLINE', 18000, 1, 'AVAILABLE', 1100000, 10000000),
  ('30H-888.22', 'XE-STA-001', 5, 2023, 'Đen', 'AUTOMATIC', 'GASOLINE', 28000, 3, 'AVAILABLE', 1400000, 15000000),
  ('51K-333.44', 'XE-XPA-001', 6, 2023, 'Trắng', 'AUTOMATIC', 'GASOLINE', 31000, 2, 'AVAILABLE', 850000, 8000000)
ON CONFLICT DO NOTHING;

-- 11. Dịch vụ gia tăng (pricing.extras)
INSERT INTO pricing.extras (code, name, description, price, price_unit)
VALUES 
  ('EXTRA_CHILD_SEAT', 'Ghế an toàn cho trẻ em', 'Ghế ngồi chuẩn ISOFIX an toàn cho bé dưới 5 tuổi', 50000, 'PER_DAY'),
  ('EXTRA_DELIVERY', 'Giao nhận xe tận nơi theo yêu cầu', 'Nhân viên giao nhận tận nhà riêng hoặc khách sạn trong nội thành', 150000, 'PER_RENTAL'),
  ('EXTRA_DASHCAM', 'Camera hành trình 4K + Thẻ 64GB', 'Ghi hình trước sau hành trình', 30000, 'PER_DAY')
ON CONFLICT (code) DO NOTHING;

-- 12. Gói bảo hiểm thuê xe (insurance.rental_packages)
INSERT INTO insurance.rental_packages (code, name, description, price_per_day, customer_deductible, coverage_text, is_default)
VALUES 
  ('PKG_BASIC', 'Gói Tiêu Chuẩn', 'Bảo hiểm trách nhiệm dân sự bắt buộc, tự chịu tối đa 5.000.000đ/vụ', 0, 5000000, 'Bảo hiểm TNDS & vật chất xe cơ bản', true),
  ('PKG_PREMIUM', 'Gói Toàn Diện 100% An Tâm', 'Miễn trừ 100% chi phí bồi thường khi va quẹt, cứu hộ 24/7 miễn phí', 150000, 0, 'Miễn trừ trách nhiệm tổn thất, cứu hộ 24/7 toàn quốc', false)
ON CONFLICT (code) DO NOTHING;

-- 13. Hình ảnh xe phong phú nhiều góc độ (core.files & fleet.vehicle_images)
DO $$
DECLARE
  f_id bigint;
BEGIN
  -- 1. VinFast VF 8 Plus
  INSERT INTO core.files(storage_provider, bucket, object_key, original_name, mime_type, is_private)
  VALUES ('LOCAL', 'vehicle-photos', 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80', 'vf8_front.jpg', 'image/jpeg', false)
  RETURNING file_id INTO f_id;
  INSERT INTO fleet.vehicle_images(vehicle_id, file_id, sort_order, is_primary, caption) VALUES (1, f_id, 0, true, 'Ngoại thất phía trước góc 3/4');

  INSERT INTO core.files(storage_provider, bucket, object_key, original_name, mime_type, is_private)
  VALUES ('LOCAL', 'vehicle-photos', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80', 'vf8_side.jpg', 'image/jpeg', false)
  RETURNING file_id INTO f_id;
  INSERT INTO fleet.vehicle_images(vehicle_id, file_id, sort_order, is_primary, caption) VALUES (1, f_id, 1, false, 'Thân xe thiết kế khí động học');

  INSERT INTO core.files(storage_provider, bucket, object_key, original_name, mime_type, is_private)
  VALUES ('LOCAL', 'vehicle-photos', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', 'vf8_interior.jpg', 'image/jpeg', false)
  RETURNING file_id INTO f_id;
  INSERT INTO fleet.vehicle_images(vehicle_id, file_id, sort_order, is_primary, caption) VALUES (1, f_id, 2, false, 'Khoang lái da cao cấp & màn hình trung tâm');

  INSERT INTO core.files(storage_provider, bucket, object_key, original_name, mime_type, is_private)
  VALUES ('LOCAL', 'vehicle-photos', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', 'vf8_rear.jpg', 'image/jpeg', false)
  RETURNING file_id INTO f_id;
  INSERT INTO fleet.vehicle_images(vehicle_id, file_id, sort_order, is_primary, caption) VALUES (1, f_id, 3, false, 'Đuôi xe dải LED thời thượng');

  -- 2. VinFast VF 3 Eco
  INSERT INTO core.files(storage_provider, bucket, object_key, original_name, mime_type, is_private)
  VALUES ('LOCAL', 'vehicle-photos', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80', 'vf3_front.jpg', 'image/jpeg', false)
  RETURNING file_id INTO f_id;
  INSERT INTO fleet.vehicle_images(vehicle_id, file_id, sort_order, is_primary, caption) VALUES (2, f_id, 0, true, 'Thiết kế Mini EV vuông vắn cá tính');

  INSERT INTO core.files(storage_provider, bucket, object_key, original_name, mime_type, is_private)
  VALUES ('LOCAL', 'vehicle-photos', 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80', 'vf3_angle.jpg', 'image/jpeg', false)
  RETURNING file_id INTO f_id;
  INSERT INTO fleet.vehicle_images(vehicle_id, file_id, sort_order, is_primary, caption) VALUES (2, f_id, 1, false, 'Xe nhỏ gọn linh hoạt trong đô thị');

  INSERT INTO core.files(storage_provider, bucket, object_key, original_name, mime_type, is_private)
  VALUES ('LOCAL', 'vehicle-photos', 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80', 'vf3_interior.jpg', 'image/jpeg', false)
  RETURNING file_id INTO f_id;
  INSERT INTO fleet.vehicle_images(vehicle_id, file_id, sort_order, is_primary, caption) VALUES (2, f_id, 2, false, 'Khoang lái tối giản thông minh');

  -- 3. Toyota Vios 1.5G
  INSERT INTO core.files(storage_provider, bucket, object_key, original_name, mime_type, is_private)
  VALUES ('LOCAL', 'vehicle-photos', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80', 'vios_front.jpg', 'image/jpeg', false)
  RETURNING file_id INTO f_id;
  INSERT INTO fleet.vehicle_images(vehicle_id, file_id, sort_order, is_primary, caption) VALUES (3, f_id, 0, true, 'Ngoại thất sedan thanh lịch tiết kiệm');

  INSERT INTO core.files(storage_provider, bucket, object_key, original_name, mime_type, is_private)
  VALUES ('LOCAL', 'vehicle-photos', 'https://images.unsplash.com/photo-1590362891988-f778047831d2?auto=format&fit=crop&w=1200&q=80', 'vios_side.jpg', 'image/jpeg', false)
  RETURNING file_id INTO f_id;
  INSERT INTO fleet.vehicle_images(vehicle_id, file_id, sort_order, is_primary, caption) VALUES (3, f_id, 1, false, 'Thân xe đầm chắc cách âm tốt');

  INSERT INTO core.files(storage_provider, bucket, object_key, original_name, mime_type, is_private)
  VALUES ('LOCAL', 'vehicle-photos', 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80', 'vios_interior.jpg', 'image/jpeg', false)
  RETURNING file_id INTO f_id;
  INSERT INTO fleet.vehicle_images(vehicle_id, file_id, sort_order, is_primary, caption) VALUES (3, f_id, 2, false, 'Khoang lái rộng rãi điều hòa mát lạnh');

  -- 4. Mazda CX-5 2.0 Premium
  INSERT INTO core.files(storage_provider, bucket, object_key, original_name, mime_type, is_private)
  VALUES ('LOCAL', 'vehicle-photos', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80', 'cx5_front.jpg', 'image/jpeg', false)
  RETURNING file_id INTO f_id;
  INSERT INTO fleet.vehicle_images(vehicle_id, file_id, sort_order, is_primary, caption) VALUES (4, f_id, 0, true, 'Thiết kế KODO thể thao sang trọng');

  INSERT INTO core.files(storage_provider, bucket, object_key, original_name, mime_type, is_private)
  VALUES ('LOCAL', 'vehicle-photos', 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80', 'cx5_side.jpg', 'image/jpeg', false)
  RETURNING file_id INTO f_id;
  INSERT INTO fleet.vehicle_images(vehicle_id, file_id, sort_order, is_primary, caption) VALUES (4, f_id, 1, false, 'Mâm hợp kim 19 inch nổi bật');

  INSERT INTO core.files(storage_provider, bucket, object_key, original_name, mime_type, is_private)
  VALUES ('LOCAL', 'vehicle-photos', 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80', 'cx5_interior.jpg', 'image/jpeg', false)
  RETURNING file_id INTO f_id;
  INSERT INTO fleet.vehicle_images(vehicle_id, file_id, sort_order, is_primary, caption) VALUES (4, f_id, 2, false, 'Ghế da Nappa & màn hình lái HUD');

  INSERT INTO core.files(storage_provider, bucket, object_key, original_name, mime_type, is_private)
  VALUES ('LOCAL', 'vehicle-photos', 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80', 'cx5_rear.jpg', 'image/jpeg', false)
  RETURNING file_id INTO f_id;
  INSERT INTO fleet.vehicle_images(vehicle_id, file_id, sort_order, is_primary, caption) VALUES (4, f_id, 3, false, 'Đuôi xe thể thao với ống xả kép');

  -- 5. Hyundai SantaFe 2.5
  INSERT INTO core.files(storage_provider, bucket, object_key, original_name, mime_type, is_private)
  VALUES ('LOCAL', 'vehicle-photos', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', 'santafe_front.jpg', 'image/jpeg', false)
  RETURNING file_id INTO f_id;
  INSERT INTO fleet.vehicle_images(vehicle_id, file_id, sort_order, is_primary, caption) VALUES (5, f_id, 0, true, 'SUV 7 chỗ đẳng cấp doanh nhân');

  INSERT INTO core.files(storage_provider, bucket, object_key, original_name, mime_type, is_private)
  VALUES ('LOCAL', 'vehicle-photos', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80', 'santafe_side.jpg', 'image/jpeg', false)
  RETURNING file_id INTO f_id;
  INSERT INTO fleet.vehicle_images(vehicle_id, file_id, sort_order, is_primary, caption) VALUES (5, f_id, 1, false, 'Thân xe bề thế trường dáng');

  INSERT INTO core.files(storage_provider, bucket, object_key, original_name, mime_type, is_private)
  VALUES ('LOCAL', 'vehicle-photos', 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80', 'santafe_interior.jpg', 'image/jpeg', false)
  RETURNING file_id INTO f_id;
  INSERT INTO fleet.vehicle_images(vehicle_id, file_id, sort_order, is_primary, caption) VALUES (5, f_id, 2, false, '3 hàng ghế da rộng rãi & cửa sổ trời Panorama');

  -- 6. Mitsubishi Xpander 1.5 AT
  INSERT INTO core.files(storage_provider, bucket, object_key, original_name, mime_type, is_private)
  VALUES ('LOCAL', 'vehicle-photos', 'https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?auto=format&fit=crop&w=1200&q=80', 'xpander_front.jpg', 'image/jpeg', false)
  RETURNING file_id INTO f_id;
  INSERT INTO fleet.vehicle_images(vehicle_id, file_id, sort_order, is_primary, caption) VALUES (6, f_id, 0, true, 'MPV 7 chỗ quốc dân cho gia đình');

  INSERT INTO core.files(storage_provider, bucket, object_key, original_name, mime_type, is_private)
  VALUES ('LOCAL', 'vehicle-photos', 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=1200&q=80', 'xpander_side.jpg', 'image/jpeg', false)
  RETURNING file_id INTO f_id;
  INSERT INTO fleet.vehicle_images(vehicle_id, file_id, sort_order, is_primary, caption) VALUES (6, f_id, 1, false, 'Gầm xe cao 225mm vượt dốc êm ái');

  INSERT INTO core.files(storage_provider, bucket, object_key, original_name, mime_type, is_private)
  VALUES ('LOCAL', 'vehicle-photos', 'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?auto=format&fit=crop&w=1200&q=80', 'xpander_interior.jpg', 'image/jpeg', false)
  RETURNING file_id INTO f_id;
  INSERT INTO fleet.vehicle_images(vehicle_id, file_id, sort_order, is_primary, caption) VALUES (6, f_id, 2, false, 'Khoang chứa đồ rộng rãi khi gập ghế');

END $$;
