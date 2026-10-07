-- =====================================================================
--  HỆ THỐNG CHO THUÊ XE (CAR RENTAL) - POSTGRESQL 14+
--  00_init.sql : Extension, Schema, ENUM, Sequence, Hàm tiện ích
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;     -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS btree_gist;   -- EXCLUDE (vehicle_id =, period &&) chống trùng lịch
CREATE EXTENSION IF NOT EXISTS pg_trgm;      -- tìm kiếm mờ theo tên/biển số
CREATE EXTENSION IF NOT EXISTS citext;       -- email không phân biệt hoa thường

SET timezone = 'Asia/Ho_Chi_Minh';

-- ---------------------------------------------------------------------
-- SCHEMA (chia theo nghiệp vụ)
-- ---------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS core;       -- cấu hình, file, sinh mã, tiện ích
CREATE SCHEMA IF NOT EXISTS iam;        -- người dùng, vai trò, phân quyền
CREATE SCHEMA IF NOT EXISTS org;        -- chi nhánh / điểm giao nhận
CREATE SCHEMA IF NOT EXISTS fleet;      -- danh mục xe, trạng thái, lịch xe  (EPIC 1)
CREATE SCHEMA IF NOT EXISTS pricing;    -- bảng giá, chính sách, khuyến mãi  (EPIC 1,2)
CREATE SCHEMA IF NOT EXISTS insurance;  -- bảo hiểm xe & gói bảo hiểm thuê
CREATE SCHEMA IF NOT EXISTS crm;        -- khách hàng, GPLX, xác minh         (EPIC 3)
CREATE SCHEMA IF NOT EXISTS booking;    -- yêu cầu thuê, duyệt, hủy           (EPIC 2,4)
CREATE SCHEMA IF NOT EXISTS rental;     -- hợp đồng, bàn giao, gia hạn        (EPIC 4,5,6,7)
CREATE SCHEMA IF NOT EXISTS incident;   -- sự cố, bồi thường, tranh chấp      (EPIC 6,7)
CREATE SCHEMA IF NOT EXISTS finance;    -- thanh toán, phí, quyết toán        (EPIC 4,7,8)
CREATE SCHEMA IF NOT EXISTS maint;      -- bảo dưỡng, sửa chữa, cảnh báo      (EPIC 8,9)
CREATE SCHEMA IF NOT EXISTS notif;      -- thông báo
CREATE SCHEMA IF NOT EXISTS audit;      -- nhật ký thay đổi
CREATE SCHEMA IF NOT EXISTS rpt;        -- view / hàm báo cáo                 (EPIC 9)

-- ---------------------------------------------------------------------
-- ENUM TYPES
-- ---------------------------------------------------------------------
-- IAM
CREATE TYPE iam.user_type          AS ENUM ('CUSTOMER','STAFF');
CREATE TYPE iam.account_status     AS ENUM ('ACTIVE','LOCKED','DISABLED','PENDING_ACTIVATION');

-- FLEET (US-01, US-02)
CREATE TYPE fleet.vehicle_status   AS ENUM (
  'AVAILABLE',     -- sẵn sàng cho thuê
  'HELD',          -- đang giữ chỗ
  'BOOKED',        -- đã có lịch thuê
  'RENTED',        -- đang cho thuê
  'INSPECTING',    -- đang kiểm tra
  'MAINTENANCE',   -- đang bảo dưỡng
  'REPAIRING',     -- đang sửa chữa
  'SUSPENDED');    -- tạm ngừng khai thác
CREATE TYPE fleet.transmission_type AS ENUM ('MANUAL','AUTOMATIC');
CREATE TYPE fleet.fuel_type         AS ENUM ('GASOLINE','DIESEL','ELECTRIC','HYBRID','PLUGIN_HYBRID','LPG');
CREATE TYPE fleet.block_type        AS ENUM ('HOLD','BOOKING','RENTAL','MAINTENANCE','REPAIR','INSPECTION','SUSPENSION');
CREATE TYPE fleet.vehicle_doc_type  AS ENUM ('REGISTRATION','INSPECTION_CERT','ROAD_FEE','OTHER');

-- PRICING
CREATE TYPE pricing.price_scope     AS ENUM ('VEHICLE','MODEL','CATEGORY');
CREATE TYPE pricing.price_plan_type AS ENUM ('DAILY','PERIOD');       -- theo ngày / theo khoảng thời gian
CREATE TYPE pricing.rule_type       AS ENUM ('WEEKEND','HOLIDAY','PEAK_SEASON','EARLY_BIRD','LONG_TERM','ONE_WAY','CUSTOM');
CREATE TYPE pricing.adjust_type     AS ENUM ('PERCENT','FIXED_PER_DAY','FIXED_TOTAL');
CREATE TYPE pricing.promo_type      AS ENUM ('PERCENT','FIXED');
CREATE TYPE pricing.fuel_policy     AS ENUM ('SAME_TO_SAME','PREPAID_FULL','FREE');

-- INSURANCE
CREATE TYPE insurance.policy_kind   AS ENUM ('COMPULSORY_TPL','PHYSICAL_DAMAGE','PASSENGER_ACCIDENT','OTHER');
CREATE TYPE insurance.claim_status  AS ENUM ('DRAFT','SUBMITTED','UNDER_REVIEW','APPROVED','PARTIALLY_APPROVED','REJECTED','PAID','CLOSED');

-- CRM
CREATE TYPE crm.gender_type         AS ENUM ('MALE','FEMALE','OTHER');
CREATE TYPE crm.customer_type       AS ENUM ('INDIVIDUAL','CORPORATE');
CREATE TYPE crm.verification_status AS ENUM ('UNVERIFIED','PENDING','VERIFIED','REJECTED','EXPIRED');
CREATE TYPE crm.id_doc_type         AS ENUM ('NATIONAL_ID','CITIZEN_ID','PASSPORT','RESIDENCE_CARD');
CREATE TYPE crm.risk_level          AS ENUM ('LOW','MEDIUM','HIGH','BLACKLISTED');

-- BOOKING
CREATE TYPE booking.booking_status  AS ENUM (
  'DRAFT','SUBMITTED','VERIFYING','VERIFICATION_FAILED','PENDING_APPROVAL',
  'APPROVED','REJECTED','AWAITING_DEPOSIT','CONFIRMED',
  'IN_RENTAL','COMPLETED','CANCELLED','EXPIRED','NO_SHOW');
CREATE TYPE booking.driver_role     AS ENUM ('MAIN','ADDITIONAL');
CREATE TYPE booking.decision_type   AS ENUM ('APPROVED','REJECTED','NEED_MORE_INFO');
CREATE TYPE booking.cancel_party    AS ENUM ('CUSTOMER','STAFF','SYSTEM');

-- RENTAL
CREATE TYPE rental.contract_status  AS ENUM (
  'DRAFT','ISSUED','ACTIVE','RETURNED','UNDER_ASSESSMENT','SETTLED','CLOSED','CANCELLED','TERMINATED');
CREATE TYPE rental.handover_type    AS ENUM ('PICKUP','RETURN');
CREATE TYPE rental.handover_status  AS ENUM ('DRAFT','COMPLETED','CANCELLED');
CREATE TYPE rental.condition_grade  AS ENUM ('EXCELLENT','GOOD','FAIR','POOR','DIRTY');
CREATE TYPE rental.extension_status AS ENUM ('REQUESTED','APPROVED','REJECTED','CANCELLED');
CREATE TYPE rental.decision_mode    AS ENUM ('AUTO','MANUAL');
CREATE TYPE rental.damage_zone      AS ENUM ('FRONT','REAR','LEFT','RIGHT','ROOF','HOOD','TRUNK','WINDSHIELD','WHEEL_TIRE','INTERIOR','ENGINE','UNDERCARRIAGE','ACCESSORY','OTHER');
CREATE TYPE rental.damage_severity  AS ENUM ('MINOR','MODERATE','MAJOR','TOTAL_LOSS');
CREATE TYPE rental.damage_status    AS ENUM ('RECORDED','UNDER_ASSESSMENT','CONFIRMED','REPAIRED','WAIVED');

-- INCIDENT
CREATE TYPE incident.incident_type   AS ENUM ('BREAKDOWN','ACCIDENT','LOST_ACCESSORY','THEFT','TRAFFIC_VIOLATION','OTHER');
CREATE TYPE incident.incident_status AS ENUM ('REPORTED','UNDER_REVIEW','INSURANCE_PROCESSING','ASSESSMENT','DISPUTED','RESOLVED','CLOSED');
CREATE TYPE incident.liable_party    AS ENUM ('INSURER','COMPANY','CUSTOMER','THIRD_PARTY');
CREATE TYPE incident.assessment_status AS ENUM ('OPEN','QUOTING','PENDING_CUSTOMER','AGREED','DISPUTED','FINALIZED','CANCELLED');
CREATE TYPE incident.dispute_status  AS ENUM ('OPEN','IN_NEGOTIATION','ESCALATED','RESOLVED','WITHDRAWN');

-- FINANCE
CREATE TYPE finance.payment_purpose AS ENUM ('DEPOSIT','ADVANCE','RENTAL_FEE','EXTENSION_FEE','PENALTY','DAMAGE_COMPENSATION','ADDITIONAL_CHARGE','REFUND');
CREATE TYPE finance.payment_direction AS ENUM ('IN','OUT');
CREATE TYPE finance.payment_method  AS ENUM ('CASH','BANK_TRANSFER','CREDIT_CARD','DEBIT_CARD','E_WALLET','VNPAY','MOMO','ZALOPAY','OTHER');
CREATE TYPE finance.payment_status  AS ENUM ('PENDING','SUCCEEDED','FAILED','CANCELLED','REFUNDED');
CREATE TYPE finance.charge_type     AS ENUM ('RENTAL','EXTENSION','EXTRA','INSURANCE','EXTRA_KM','LATE_RETURN','FUEL_SHORTAGE','CLEANING','DAMAGE','LOST_ACCESSORY','TRAFFIC_FINE','DISCOUNT','OTHER');
CREATE TYPE finance.charge_status   AS ENUM ('DRAFT','PENDING','WAIVED','VOID','SETTLED');
CREATE TYPE finance.deposit_status  AS ENUM ('PENDING','HELD','APPLIED','REFUNDED','FORFEITED');
CREATE TYPE finance.settlement_status AS ENUM ('DRAFT','CONFIRMED','SETTLED','CANCELLED');
CREATE TYPE finance.invoice_status  AS ENUM ('DRAFT','ISSUED','PAID','CANCELLED');

-- MAINTENANCE
CREATE TYPE maint.order_type        AS ENUM ('PERIODIC','REPAIR','ACCIDENT_REPAIR','INSPECTION','CLEANING','TIRE','OTHER');
CREATE TYPE maint.order_status      AS ENUM ('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED');
CREATE TYPE maint.alert_type        AS ENUM ('INSURANCE_EXPIRING','REGISTRATION_EXPIRING','INSPECTION_EXPIRING','MAINTENANCE_DUE_KM','MAINTENANCE_DUE_DATE','LICENSE_EXPIRING');
CREATE TYPE maint.alert_status      AS ENUM ('OPEN','ACKNOWLEDGED','RESOLVED','DISMISSED');
CREATE TYPE maint.alert_severity    AS ENUM ('INFO','WARNING','CRITICAL');

-- NOTIF
CREATE TYPE notif.channel           AS ENUM ('IN_APP','EMAIL','SMS','PUSH','ZALO');
CREATE TYPE notif.delivery_status   AS ENUM ('PENDING','SENT','DELIVERED','FAILED','READ');

-- ---------------------------------------------------------------------
-- SEQUENCE sinh mã nghiệp vụ
-- ---------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS core.seq_customer;  CREATE SEQUENCE IF NOT EXISTS core.seq_booking;
CREATE SEQUENCE IF NOT EXISTS core.seq_contract;  CREATE SEQUENCE IF NOT EXISTS core.seq_handover;
CREATE SEQUENCE IF NOT EXISTS core.seq_payment;   CREATE SEQUENCE IF NOT EXISTS core.seq_incident;
CREATE SEQUENCE IF NOT EXISTS core.seq_claim;     CREATE SEQUENCE IF NOT EXISTS core.seq_assessment;
CREATE SEQUENCE IF NOT EXISTS core.seq_dispute;   CREATE SEQUENCE IF NOT EXISTS core.seq_settlement;
CREATE SEQUENCE IF NOT EXISTS core.seq_invoice;   CREATE SEQUENCE IF NOT EXISTS core.seq_maint_order;
CREATE SEQUENCE IF NOT EXISTS core.seq_extension; CREATE SEQUENCE IF NOT EXISTS core.seq_staff;

-- Mã dạng PREFIX-YYMM-000001
CREATE OR REPLACE FUNCTION core.gen_code(p_prefix text, p_seq regclass)
RETURNS text LANGUAGE sql VOLATILE AS $$
  SELECT p_prefix || '-' || to_char(now(),'YYMM') || '-' || lpad(nextval(p_seq)::text, 6, '0');
$$;

-- Trigger tự cập nhật updated_at
CREATE OR REPLACE FUNCTION core.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$;

-- Lấy user hiện tại từ session (ứng dụng gọi: SET app.current_user_id = '<id>')
CREATE OR REPLACE FUNCTION core.current_user_id()
RETURNS bigint LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.current_user_id', true), '')::bigint;
$$;
