-- Add new deposit methods to the enum
ALTER TYPE deposit_method ADD VALUE IF NOT EXISTS 'paytm';
ALTER TYPE deposit_method ADD VALUE IF NOT EXISTS 'googlepay';
ALTER TYPE deposit_method ADD VALUE IF NOT EXISTS 'phonepay';
ALTER TYPE deposit_method ADD VALUE IF NOT EXISTS 'binance';