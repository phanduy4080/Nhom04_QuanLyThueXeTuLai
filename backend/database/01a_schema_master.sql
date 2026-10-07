-- =====================================================================
--  01a_schema_master.sql : Dữ liệu nền - IAM, Chi nhánh, Xe, Giá, Bảo hiểm, Khách hàng
-- =====================================================================

-- =====================================================================
-- CORE
-- =====================================================================
CREATE TABLE IF NOT EXISTS core.settings (
  setting_key  text PRIMARY KEY,
  value        text NOT NULL,
  value_type   text NOT NULL DEFAULT 'string' CHECK (value_type IN ('string','int','numeric','bool','json')),
  description  text,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  updated_by   bigint
);
COMMENT ON TABLE core.settings IS 'Tham số cấu hình hệ thống (đệm lịch, thời gian giữ chỗ, VAT, ngưỡng cảnh báo...)';

CREATE OR REPLACE FUNCTION core.get_setting(p_key text, p_default text DEFAULT NULL)
RETURNS text LANGUAGE sql STABLE AS $$
  SELECT COALESCE((SELECT value FROM core.settings WHERE setting_key = p_key), p_default);
$$;

-- =====================================================================
-- IAM
-- =====================================================================
CREATE TABLE IF NOT EXISTS iam.users (
  user_id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  public_id          uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  user_type          iam.user_type NOT NULL,
  email              citext UNIQUE,
  phone              text   UNIQUE,
  password_hash      text,
  status             iam.account_status NOT NULL DEFAULT 'PENDING_ACTIVATION',
  email_verified_at  timestamptz,
  phone_verified_at  timestamptz,
  mfa_enabled        boolean NOT NULL DEFAULT false,
  failed_login_count smallint NOT NULL DEFAULT 0,
  locked_until       timestamptz,
  last_login_at      timestamptz,
  last_login_ip      inet,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  deleted_at         timestamptz,
  CONSTRAINT ck_users_contact CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_upd') THEN
    CREATE TRIGGER trg_users_upd BEFORE UPDATE ON iam.users FOR EACH ROW EXECUTE FUNCTION core.set_updated_at();
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS iam.roles (
  role_id     int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        text NOT NULL UNIQUE,          -- ADMIN, MANAGER, STAFF, ACCOUNTANT, CUSTOMER...
  name        text NOT NULL,
  description text,
  is_system   boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS iam.permissions (
  permission_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code          text NOT NULL UNIQUE,        -- vd: vehicle.manage, booking.approve
  module        text NOT NULL,
  description   text
);

CREATE TABLE IF NOT EXISTS iam.role_permissions (
  role_id       int NOT NULL REFERENCES iam.roles ON DELETE CASCADE,
  permission_id int NOT NULL REFERENCES iam.permissions ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS iam.user_roles (
  user_id     bigint NOT NULL REFERENCES iam.users ON DELETE CASCADE,
  role_id     int    NOT NULL REFERENCES iam.roles ON DELETE CASCADE,
  granted_at  timestamptz NOT NULL DEFAULT now(),
  granted_by  bigint REFERENCES iam.users,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS iam.login_history (
  login_id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    bigint REFERENCES iam.users ON DELETE SET NULL,
  identifier text,
  success    boolean NOT NULL,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_login_history_user ON iam.login_history(user_id, created_at DESC);

-- =====================================================================
-- ORG
-- =====================================================================
CREATE TABLE IF NOT EXISTS org.branches (
  branch_id     int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code          text NOT NULL UNIQUE,
  name          text NOT NULL,
  address_line  text NOT NULL,
  ward          text,
  district      text,
  province      text NOT NULL,
  latitude      numeric(9,6),
  longitude     numeric(9,6),
  phone         text,
  email         citext,
  is_pickup_point boolean NOT NULL DEFAULT true,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_branches_upd') THEN
    CREATE TRIGGER trg_branches_upd BEFORE UPDATE ON org.branches FOR EACH ROW EXECUTE FUNCTION core.set_updated_at();
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS ix_branches_province ON org.branches(province) WHERE is_active;

CREATE TABLE IF NOT EXISTS org.branch_hours (
  branch_id   int NOT NULL REFERENCES org.branches ON DELETE CASCADE,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0 = Chủ nhật
  open_time   time,
  close_time  time,
  is_closed   boolean NOT NULL DEFAULT false,
  PRIMARY KEY (branch_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS iam.staff (
  staff_id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       bigint NOT NULL UNIQUE REFERENCES iam.users,
  staff_code    text NOT NULL UNIQUE DEFAULT core.gen_code('NV','core.seq_staff'),
  full_name     text NOT NULL,
  branch_id     int REFERENCES org.branches,
  position      text,
  department    text,
  phone         text,
  hired_date    date,
  terminated_date date,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_staff_upd') THEN
    CREATE TRIGGER trg_staff_upd BEFORE UPDATE ON iam.staff FOR EACH ROW EXECUTE FUNCTION core.set_updated_at();
  END IF;
END $$;

-- File / media dùng chung
CREATE TABLE IF NOT EXISTS core.files (
  file_id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  public_id       uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  storage_provider text NOT NULL DEFAULT 's3',
  bucket          text,
  object_key      text NOT NULL,
  original_name   text,
  mime_type       text,
  size_bytes      bigint CHECK (size_bytes IS NULL OR size_bytes >= 0),
  checksum_sha256 text,
  is_private      boolean NOT NULL DEFAULT true,
  uploaded_by     bigint REFERENCES iam.users,
  created_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz,
  UNIQUE (storage_provider, bucket, object_key)
);

-- =====================================================================
-- FLEET
-- =====================================================================
CREATE TABLE IF NOT EXISTS fleet.vehicle_categories (
  category_id   int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code          text NOT NULL UNIQUE,         -- SEDAN, SUV, MPV, HATCHBACK, PICKUP, LUXURY, EV, MINIBUS
  name          text NOT NULL,
  description   text,
  required_license_classes text[] NOT NULL DEFAULT '{B1,B2}',
  sort_order    int NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS fleet.brands (
  brand_id   int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       text NOT NULL UNIQUE,
  country    text,
  logo_file_id bigint REFERENCES core.files,
  is_active  boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS fleet.vehicle_models (
  model_id       int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  brand_id       int NOT NULL REFERENCES fleet.brands,
  category_id    int NOT NULL REFERENCES fleet.vehicle_categories,
  name           text NOT NULL,
  variant        text NOT NULL DEFAULT '',
  seats          smallint NOT NULL CHECK (seats BETWEEN 2 AND 60),
  doors          smallint CHECK (doors BETWEEN 2 AND 6),
  transmission   fleet.transmission_type NOT NULL,
  fuel_type      fleet.fuel_type NOT NULL,
  engine_cc      int CHECK (engine_cc > 0),
  power_hp       int CHECK (power_hp > 0),
  fuel_tank_liters numeric(6,1) CHECK (fuel_tank_liters > 0),
  battery_kwh    numeric(6,1) CHECK (battery_kwh > 0),
  ev_range_km    int CHECK (ev_range_km > 0),
  trunk_liters   int CHECK (trunk_liters >= 0),
  fuel_consumption_l100km numeric(4,1),
  launch_year    smallint,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (brand_id, name, variant, transmission, fuel_type)
);
CREATE INDEX IF NOT EXISTS ix_models_category ON fleet.vehicle_models(category_id);

CREATE TABLE IF NOT EXISTS fleet.vehicle_features (
  feature_id  int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        text NOT NULL UNIQUE,
  name        text NOT NULL,
  icon        text
);

-- Chính sách thuê
CREATE TABLE IF NOT EXISTS pricing.rental_policies (
  policy_id               int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code                    text NOT NULL UNIQUE,
  name                    text NOT NULL,
  description             text,
  min_driver_age          smallint NOT NULL DEFAULT 21 CHECK (min_driver_age >= 18),
  max_driver_age          smallint CHECK (max_driver_age IS NULL OR max_driver_age > min_driver_age),
  min_license_years       numeric(3,1) NOT NULL DEFAULT 1 CHECK (min_license_years >= 0),
  max_serious_incidents_12m smallint NOT NULL DEFAULT 2,
  require_verification    boolean NOT NULL DEFAULT true,
  max_additional_drivers  smallint NOT NULL DEFAULT 2,
  additional_driver_fee_per_day numeric(12,2) NOT NULL DEFAULT 0,
  min_rental_hours        int NOT NULL DEFAULT 4,
  max_rental_days         int NOT NULL DEFAULT 90,
  grace_minutes           int NOT NULL DEFAULT 60 CHECK (grace_minutes >= 0),
  late_fee_percent_per_hour numeric(5,2) NOT NULL DEFAULT 10,
  late_day_multiplier     numeric(4,2) NOT NULL DEFAULT 1.5,
  extra_km_fee            numeric(12,2) NOT NULL DEFAULT 5000,
  fuel_policy             pricing.fuel_policy NOT NULL DEFAULT 'SAME_TO_SAME',
  fuel_shortage_fee_per_percent numeric(12,2) NOT NULL DEFAULT 20000,
  cleaning_fee            numeric(12,2) NOT NULL DEFAULT 200000,
  max_extension_days      int NOT NULL DEFAULT 30,
  extension_min_notice_hours int NOT NULL DEFAULT 6,
  deposit_percent_of_rent numeric(5,2),
  terms_text              text,
  insurance_terms_text    text,
  liability_terms_text    text,
  is_active               boolean NOT NULL DEFAULT true,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_policies_upd') THEN
    CREATE TRIGGER trg_policies_upd BEFORE UPDATE ON pricing.rental_policies FOR EACH ROW EXECUTE FUNCTION core.set_updated_at();
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS pricing.cancellation_rules (
  rule_id           int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  policy_id         int NOT NULL REFERENCES pricing.rental_policies ON DELETE CASCADE,
  hours_before_min  int NOT NULL CHECK (hours_before_min >= 0),
  hours_before_max  int,
  fee_percent       numeric(5,2) NOT NULL DEFAULT 0 CHECK (fee_percent BETWEEN 0 AND 100),
  fee_fixed         numeric(12,2) NOT NULL DEFAULT 0,
  description       text,
  CHECK (hours_before_max IS NULL OR hours_before_max > hours_before_min)
);
CREATE INDEX IF NOT EXISTS ix_cancel_rules_policy ON pricing.cancellation_rules(policy_id, hours_before_min);

ALTER TABLE fleet.vehicle_categories ADD COLUMN IF NOT EXISTS default_policy_id int REFERENCES pricing.rental_policies;

CREATE TABLE IF NOT EXISTS fleet.vehicles (
  vehicle_id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  public_id         uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  asset_code        text UNIQUE,
  license_plate     text NOT NULL,
  vin               text,
  engine_number     text,
  model_id          int NOT NULL REFERENCES fleet.vehicle_models,
  manufacture_year  smallint CHECK (manufacture_year BETWEEN 1990 AND 2100),
  color             text,
  seats             smallint CHECK (seats BETWEEN 2 AND 60),
  transmission      fleet.transmission_type NOT NULL,
  fuel_type         fleet.fuel_type NOT NULL,
  odometer_km       int NOT NULL DEFAULT 0 CHECK (odometer_km >= 0),
  fuel_level_percent numeric(5,2) CHECK (fuel_level_percent BETWEEN 0 AND 100),
  current_branch_id int REFERENCES org.branches,
  status            fleet.vehicle_status NOT NULL DEFAULT 'AVAILABLE',
  status_changed_at timestamptz NOT NULL DEFAULT now(),
  list_price_per_day numeric(12,2) NOT NULL CHECK (list_price_per_day >= 0),
  deposit_amount    numeric(12,2) NOT NULL DEFAULT 0 CHECK (deposit_amount >= 0),
  daily_km_limit    int CHECK (daily_km_limit > 0),
  extra_km_fee      numeric(12,2) CHECK (extra_km_fee >= 0),
  policy_id         int REFERENCES pricing.rental_policies,
  ownership_type    text NOT NULL DEFAULT 'OWNED' CHECK (ownership_type IN ('OWNED','LEASED','CONSIGNED')),
  purchase_date     date,
  purchase_price    numeric(15,2),
  gps_device_id     text,
  is_active         boolean NOT NULL DEFAULT true,
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  created_by        bigint REFERENCES iam.users,
  deleted_at        timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_vehicles_plate ON fleet.vehicles (upper(regexp_replace(license_plate,'[\s.\-]','','g'))) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_vehicles_vin   ON fleet.vehicles (vin) WHERE vin IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_vehicles_status   ON fleet.vehicles(status)            WHERE is_active AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS ix_vehicles_branch   ON fleet.vehicles(current_branch_id) WHERE is_active AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS ix_vehicles_model    ON fleet.vehicles(model_id);
CREATE INDEX IF NOT EXISTS ix_vehicles_plate_trgm ON fleet.vehicles USING gin (license_plate gin_trgm_ops);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_vehicles_upd') THEN
    CREATE TRIGGER trg_vehicles_upd BEFORE UPDATE ON fleet.vehicles FOR EACH ROW EXECUTE FUNCTION core.set_updated_at();
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS fleet.vehicle_feature_map (
  vehicle_id bigint NOT NULL REFERENCES fleet.vehicles ON DELETE CASCADE,
  feature_id int    NOT NULL REFERENCES fleet.vehicle_features,
  PRIMARY KEY (vehicle_id, feature_id)
);

CREATE TABLE IF NOT EXISTS fleet.vehicle_images (
  image_id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  vehicle_id  bigint NOT NULL REFERENCES fleet.vehicles ON DELETE CASCADE,
  file_id     bigint NOT NULL REFERENCES core.files,
  sort_order  int NOT NULL DEFAULT 0,
  is_primary  boolean NOT NULL DEFAULT false,
  caption     text
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_vehicle_primary_image ON fleet.vehicle_images(vehicle_id) WHERE is_primary;

CREATE TABLE IF NOT EXISTS fleet.vehicle_documents (
  doc_id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  vehicle_id    bigint NOT NULL REFERENCES fleet.vehicles ON DELETE CASCADE,
  doc_type      fleet.vehicle_doc_type NOT NULL,
  doc_number    text,
  issue_date    date,
  expiry_date   date,
  issuing_authority text,
  alert_days_before int NOT NULL DEFAULT 30,
  file_id       bigint REFERENCES core.files,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CHECK (expiry_date IS NULL OR issue_date IS NULL OR expiry_date >= issue_date)
);
CREATE INDEX IF NOT EXISTS ix_vehicle_docs_expiry ON fleet.vehicle_documents(expiry_date);
CREATE INDEX IF NOT EXISTS ix_vehicle_docs_vehicle ON fleet.vehicle_documents(vehicle_id, doc_type);

CREATE TABLE IF NOT EXISTS fleet.vehicle_status_transitions (
  from_status fleet.vehicle_status NOT NULL,
  to_status   fleet.vehicle_status NOT NULL,
  PRIMARY KEY (from_status, to_status)
);

CREATE TABLE IF NOT EXISTS fleet.vehicle_status_history (
  history_id  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  vehicle_id  bigint NOT NULL REFERENCES fleet.vehicles ON DELETE CASCADE,
  from_status fleet.vehicle_status,
  to_status   fleet.vehicle_status NOT NULL,
  reason      text,
  source_type text,
  source_id   bigint,
  changed_by  bigint REFERENCES iam.users,
  changed_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_vsh_vehicle ON fleet.vehicle_status_history(vehicle_id, changed_at DESC);

CREATE TABLE IF NOT EXISTS fleet.vehicle_odometer_logs (
  log_id       bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  vehicle_id   bigint NOT NULL REFERENCES fleet.vehicles ON DELETE CASCADE,
  odometer_km  int NOT NULL CHECK (odometer_km >= 0),
  fuel_level_percent numeric(5,2),
  source_type  text NOT NULL,
  source_id    bigint,
  recorded_at  timestamptz NOT NULL DEFAULT now(),
  recorded_by  bigint REFERENCES iam.users
);
CREATE INDEX IF NOT EXISTS ix_odo_vehicle ON fleet.vehicle_odometer_logs(vehicle_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS fleet.vehicle_availability_blocks (
  block_id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  vehicle_id      bigint NOT NULL REFERENCES fleet.vehicles ON DELETE CASCADE,
  block_type      fleet.block_type NOT NULL,
  period          tstzrange NOT NULL,
  is_active       boolean NOT NULL DEFAULT true,
  ref_type        text,
  ref_id          bigint,
  hold_expires_at timestamptz,
  note            text,
  created_by      bigint REFERENCES iam.users,
  created_at      timestamptz NOT NULL DEFAULT now(),
  released_at     timestamptz,
  CONSTRAINT ck_block_period CHECK (NOT isempty(period) AND lower(period) IS NOT NULL),
  CONSTRAINT ck_block_hold   CHECK (block_type <> 'HOLD' OR hold_expires_at IS NOT NULL),
  CONSTRAINT ex_vehicle_no_overlap EXCLUDE USING gist (vehicle_id WITH =, period WITH &&) WHERE (is_active)
);
CREATE INDEX IF NOT EXISTS ix_blocks_vehicle ON fleet.vehicle_availability_blocks(vehicle_id, block_type) WHERE is_active;
CREATE INDEX IF NOT EXISTS ix_blocks_ref     ON fleet.vehicle_availability_blocks(ref_type, ref_id);
CREATE INDEX IF NOT EXISTS ix_blocks_period  ON fleet.vehicle_availability_blocks USING gist (period) WHERE is_active;
CREATE INDEX IF NOT EXISTS ix_blocks_hold_exp ON fleet.vehicle_availability_blocks(hold_expires_at) WHERE is_active AND block_type = 'HOLD';

-- =====================================================================
-- PRICING
-- =====================================================================
CREATE TABLE IF NOT EXISTS pricing.price_plans (
  plan_id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name         text NOT NULL,
  plan_type    pricing.price_plan_type NOT NULL DEFAULT 'DAILY',
  scope        pricing.price_scope NOT NULL,
  vehicle_id   bigint REFERENCES fleet.vehicles ON DELETE CASCADE,
  model_id     int    REFERENCES fleet.vehicle_models ON DELETE CASCADE,
  category_id  int    REFERENCES fleet.vehicle_categories ON DELETE CASCADE,
  branch_id    int    REFERENCES org.branches,
  valid_from   date NOT NULL DEFAULT current_date,
  valid_to     date,
  priority     int NOT NULL DEFAULT 100,
  currency     char(3) NOT NULL DEFAULT 'VND',
  is_active    boolean NOT NULL DEFAULT true,
  note         text,
  created_by   bigint REFERENCES iam.users,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_plan_dates CHECK (valid_to IS NULL OR valid_to >= valid_from),
  CONSTRAINT ck_plan_scope CHECK (
    (scope = 'VEHICLE'  AND vehicle_id  IS NOT NULL AND model_id IS NULL AND category_id IS NULL) OR
    (scope = 'MODEL'    AND model_id    IS NOT NULL AND vehicle_id IS NULL AND category_id IS NULL) OR
    (scope = 'CATEGORY' AND category_id IS NOT NULL AND vehicle_id IS NULL AND model_id IS NULL))
);
CREATE INDEX IF NOT EXISTS ix_price_plans_vehicle  ON pricing.price_plans(vehicle_id)  WHERE is_active;
CREATE INDEX IF NOT EXISTS ix_price_plans_model    ON pricing.price_plans(model_id)    WHERE is_active;
CREATE INDEX IF NOT EXISTS ix_price_plans_category ON pricing.price_plans(category_id) WHERE is_active;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_price_plans_upd') THEN
    CREATE TRIGGER trg_price_plans_upd BEFORE UPDATE ON pricing.price_plans FOR EACH ROW EXECUTE FUNCTION core.set_updated_at();
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS pricing.price_tiers (
  tier_id       bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  plan_id       bigint NOT NULL REFERENCES pricing.price_plans ON DELETE CASCADE,
  min_days      int NOT NULL DEFAULT 1 CHECK (min_days >= 1),
  max_days      int,
  price_per_day numeric(12,2) NOT NULL CHECK (price_per_day >= 0),
  CHECK (max_days IS NULL OR max_days >= min_days),
  UNIQUE (plan_id, min_days)
);

CREATE TABLE IF NOT EXISTS pricing.holidays (
  holiday_id   int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  holiday_date date NOT NULL,
  name         text NOT NULL,
  country      char(2) NOT NULL DEFAULT 'VN',
  UNIQUE (holiday_date, country)
);

CREATE TABLE IF NOT EXISTS pricing.price_rules (
  rule_id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name         text NOT NULL,
  rule_type    pricing.rule_type NOT NULL,
  adjust_type  pricing.adjust_type NOT NULL DEFAULT 'PERCENT',
  adjust_value numeric(12,2) NOT NULL,
  category_id  int REFERENCES fleet.vehicle_categories,
  branch_id    int REFERENCES org.branches,
  valid_from   date,
  valid_to     date,
  days_of_week smallint[],
  min_rental_days int,
  priority     int NOT NULL DEFAULT 100,
  is_active    boolean NOT NULL DEFAULT true,
  CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from)
);

CREATE TABLE IF NOT EXISTS pricing.extras (
  extra_id    int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        text NOT NULL UNIQUE,
  name        text NOT NULL,
  description text,
  price       numeric(12,2) NOT NULL CHECK (price >= 0),
  price_unit  text NOT NULL DEFAULT 'PER_RENTAL' CHECK (price_unit IN ('PER_DAY','PER_RENTAL')),
  is_active   boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS pricing.promotions (
  promotion_id   int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code           citext NOT NULL UNIQUE,
  name           text NOT NULL,
  description    text,
  promo_type     pricing.promo_type NOT NULL,
  value          numeric(12,2) NOT NULL CHECK (value > 0),
  max_discount   numeric(12,2),
  min_order_amount numeric(12,2) NOT NULL DEFAULT 0,
  min_rental_days int NOT NULL DEFAULT 1,
  category_ids   int[],
  valid_from     timestamptz NOT NULL DEFAULT now(),
  valid_to       timestamptz,
  usage_limit    int,
  usage_per_customer int NOT NULL DEFAULT 1,
  used_count     int NOT NULL DEFAULT 0,
  is_active      boolean NOT NULL DEFAULT true,
  CHECK (promo_type <> 'PERCENT' OR value <= 100)
);

-- =====================================================================
-- INSURANCE
-- =====================================================================
CREATE TABLE IF NOT EXISTS insurance.insurers (
  insurer_id   int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name         text NOT NULL UNIQUE,
  tax_code     text,
  hotline      text,
  email        citext,
  claim_contact text,
  address      text,
  is_active    boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS insurance.vehicle_policies (
  vehicle_policy_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  vehicle_id    bigint NOT NULL REFERENCES fleet.vehicles ON DELETE CASCADE,
  insurer_id    int    NOT NULL REFERENCES insurance.insurers,
  kind          insurance.policy_kind NOT NULL,
  policy_number text NOT NULL,
  start_date    date NOT NULL,
  end_date      date NOT NULL,
  premium       numeric(14,2) CHECK (premium >= 0),
  sum_insured   numeric(15,2),
  deductible    numeric(14,2) NOT NULL DEFAULT 0,
  alert_days_before int NOT NULL DEFAULT 30,
  file_id       bigint REFERENCES core.files,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date),
  UNIQUE (insurer_id, policy_number)
);
CREATE INDEX IF NOT EXISTS ix_vpol_vehicle ON insurance.vehicle_policies(vehicle_id, kind);
CREATE INDEX IF NOT EXISTS ix_vpol_end     ON insurance.vehicle_policies(end_date) WHERE is_active;

CREATE TABLE IF NOT EXISTS insurance.rental_packages (
  package_id        int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code              text NOT NULL UNIQUE,
  name              text NOT NULL,
  description       text,
  price_per_day     numeric(12,2) NOT NULL DEFAULT 0 CHECK (price_per_day >= 0),
  customer_deductible numeric(14,2) NOT NULL DEFAULT 0,
  coverage_limit    numeric(15,2),
  coverage_text     text,
  is_default        boolean NOT NULL DEFAULT false,
  is_active         boolean NOT NULL DEFAULT true
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_rental_pkg_default ON insurance.rental_packages(is_default) WHERE is_default;

-- =====================================================================
-- CRM
-- =====================================================================
CREATE TABLE IF NOT EXISTS crm.license_classes (
  code         text PRIMARY KEY,
  description  text NOT NULL,
  max_seats    smallint,
  min_age      smallint
);

CREATE TABLE IF NOT EXISTS crm.customers (
  customer_id     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  public_id       uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  customer_code   text NOT NULL UNIQUE DEFAULT core.gen_code('KH','core.seq_customer'),
  user_id         bigint UNIQUE REFERENCES iam.users,
  customer_type   crm.customer_type NOT NULL DEFAULT 'INDIVIDUAL',
  full_name       text NOT NULL,
  date_of_birth   date,
  gender          crm.gender_type,
  nationality     char(2) NOT NULL DEFAULT 'VN',
  phone           text,
  email           citext,
  address_line    text,
  ward            text,
  district        text,
  province        text,
  company_name    text,
  tax_code        text,
  company_address text,
  emergency_contact_name  text,
  emergency_contact_phone text,
  verification_status crm.verification_status NOT NULL DEFAULT 'UNVERIFIED',
  risk_level      crm.risk_level NOT NULL DEFAULT 'LOW',
  completed_rentals int NOT NULL DEFAULT 0,
  loyalty_points  int NOT NULL DEFAULT 0 CHECK (loyalty_points >= 0),
  marketing_opt_in boolean NOT NULL DEFAULT false,
  preferred_language text NOT NULL DEFAULT 'vi',
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz,
  CONSTRAINT ck_customer_corp CHECK (customer_type <> 'CORPORATE' OR company_name IS NOT NULL),
  CONSTRAINT ck_customer_dob  CHECK (date_of_birth IS NULL OR date_of_birth < current_date)
);
CREATE INDEX IF NOT EXISTS ix_customers_phone ON crm.customers(phone);
CREATE INDEX IF NOT EXISTS ix_customers_email ON crm.customers(email);
CREATE INDEX IF NOT EXISTS ix_customers_name_trgm ON crm.customers USING gin (full_name gin_trgm_ops);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_customers_upd') THEN
    CREATE TRIGGER trg_customers_upd BEFORE UPDATE ON crm.customers FOR EACH ROW EXECUTE FUNCTION core.set_updated_at();
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS crm.identity_documents (
  doc_id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id     bigint NOT NULL REFERENCES crm.customers ON DELETE CASCADE,
  doc_type        crm.id_doc_type NOT NULL,
  doc_number      text NOT NULL,
  full_name_on_doc text,
  date_of_birth_on_doc date,
  issue_date      date,
  issue_place     text,
  expiry_date     date,
  front_file_id   bigint REFERENCES core.files,
  back_file_id    bigint REFERENCES core.files,
  selfie_file_id  bigint REFERENCES core.files,
  status          crm.verification_status NOT NULL DEFAULT 'PENDING',
  verified_by     bigint REFERENCES iam.users,
  verified_at     timestamptz,
  reject_reason   text,
  is_current      boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (doc_type, doc_number, customer_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_idoc_current ON crm.identity_documents(customer_id) WHERE is_current;
CREATE INDEX IF NOT EXISTS ix_idoc_number ON crm.identity_documents(doc_number);

CREATE TABLE IF NOT EXISTS crm.driver_licenses (
  license_id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id     bigint NOT NULL REFERENCES crm.customers ON DELETE CASCADE,
  license_number  text NOT NULL,
  license_class   text NOT NULL REFERENCES crm.license_classes,
  issued_country  char(2) NOT NULL DEFAULT 'VN',
  is_international boolean NOT NULL DEFAULT false,
  issue_date      date NOT NULL,
  expiry_date     date,
  issue_place     text,
  front_file_id   bigint REFERENCES core.files,
  back_file_id    bigint REFERENCES core.files,
  status          crm.verification_status NOT NULL DEFAULT 'PENDING',
  verified_by     bigint REFERENCES iam.users,
  verified_at     timestamptz,
  reject_reason   text,
  is_current      boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CHECK (expiry_date IS NULL OR expiry_date >= issue_date),
  UNIQUE (license_number, issued_country, license_class)
);
CREATE INDEX IF NOT EXISTS ix_license_customer ON crm.driver_licenses(customer_id) WHERE is_current;
CREATE INDEX IF NOT EXISTS ix_license_expiry   ON crm.driver_licenses(expiry_date);

CREATE TABLE IF NOT EXISTS crm.customer_blacklist (
  blacklist_id  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id   bigint NOT NULL REFERENCES crm.customers ON DELETE CASCADE,
  reason        text NOT NULL,
  source_type   text,
  source_id     bigint,
  listed_at     timestamptz NOT NULL DEFAULT now(),
  listed_by     bigint REFERENCES iam.users,
  expires_at    timestamptz,
  lifted_at     timestamptz,
  lifted_by     bigint REFERENCES iam.users,
  is_active     boolean NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS ix_blacklist_customer ON crm.customer_blacklist(customer_id) WHERE is_active;
