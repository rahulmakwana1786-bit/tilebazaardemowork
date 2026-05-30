CREATE TABLE IF NOT EXISTS public.delivery_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_name text NOT NULL,
  postcode_prefixes text[] NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.delivery_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid REFERENCES public.delivery_zones(id) ON DELETE CASCADE,
  pallet_type text NOT NULL,
  price numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (zone_id, pallet_type)
);

-- Alter cart_items
ALTER TABLE public.cart_items 
ADD COLUMN IF NOT EXISTS sqm numeric,
ADD COLUMN IF NOT EXISTS boxes integer,
ADD COLUMN IF NOT EXISTS tiles integer,
ADD COLUMN IF NOT EXISTS weight numeric,
ADD COLUMN IF NOT EXISTS pallet_type text,
ADD COLUMN IF NOT EXISTS delivery_charge numeric;

-- Alter order_items
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS sqm numeric,
ADD COLUMN IF NOT EXISTS boxes integer,
ADD COLUMN IF NOT EXISTS tiles integer,
ADD COLUMN IF NOT EXISTS weight numeric,
ADD COLUMN IF NOT EXISTS pallet_type text,
ADD COLUMN IF NOT EXISTS delivery_charge numeric;

-- Optional Default Data
INSERT INTO public.delivery_zones (id, zone_name, postcode_prefixes) 
VALUES ('11111111-1111-1111-1111-111111111111', 'Mainland UK', '{"AL", "B", "BA", "BB", "BD", "BH", "BL", "BN", "BR", "BS", "CB", "CF", "CH", "CM", "CO", "CR", "CT", "CV", "CW", "DA", "DE", "DH", "DL", "DN", "DT", "DY", "E", "EC", "EN", "EX", "FY", "GL", "GU", "HA", "HD", "HG", "HP", "HR", "HU", "HX", "IG", "IP", "KT", "L", "LA", "LD", "LE", "LL", "LN", "LS", "LU", "M", "ME", "MK", "N", "NE", "NG", "NN", "NP", "NR", "NW", "OL", "OX", "PE", "PO", "PR", "RG", "RH", "RM", "S", "SA", "SE", "SG", "SK", "SL", "SM", "SN", "SO", "SP", "SR", "SS", "ST", "SW", "SY", "TA", "TF", "TN", "TQ", "TR", "TS", "TW", "UB", "W", "WA", "WC", "WD", "WF", "WN", "WR", "WS", "WV", "YO"}')
ON CONFLICT DO NOTHING;

INSERT INTO public.delivery_rates (zone_id, pallet_type, price) VALUES 
('11111111-1111-1111-1111-111111111111', 'PARCEL', 15.00),
('11111111-1111-1111-1111-111111111111', 'QUARTER', 35.00),
('11111111-1111-1111-1111-111111111111', 'HALF', 45.00),
('11111111-1111-1111-1111-111111111111', 'FULL LIGHT', 55.00),
('11111111-1111-1111-1111-111111111111', 'FULL', 65.00)
ON CONFLICT DO NOTHING;
