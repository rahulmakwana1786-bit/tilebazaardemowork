CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR UNIQUE NOT NULL,
    type VARCHAR NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value NUMERIC NOT NULL,
    active BOOLEAN DEFAULT true
);

INSERT INTO coupons (code, type, value, active)
VALUES 
    ('WELCOME10', 'percentage', 10, true),
    ('SAVE20', 'fixed', 20, true)
ON CONFLICT (code) DO NOTHING;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR;
