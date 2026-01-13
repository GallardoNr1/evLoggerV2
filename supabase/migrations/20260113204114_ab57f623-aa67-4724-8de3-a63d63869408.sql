-- Add unique constraint on starts_at for upsert to work
ALTER TABLE public.electricity_prices 
ADD CONSTRAINT electricity_prices_starts_at_key UNIQUE (starts_at);