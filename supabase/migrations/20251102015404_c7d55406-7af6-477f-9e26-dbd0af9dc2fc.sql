-- Add credits and plan management to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS credits_balance INTEGER NOT NULL DEFAULT 10,
ADD COLUMN IF NOT EXISTS nome_alteracao_usada BOOLEAN NOT NULL DEFAULT FALSE;

-- Add credits_used tracking to scripts_protected table
ALTER TABLE public.scripts_protected
ADD COLUMN IF NOT EXISTS credits_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS protection_level TEXT DEFAULT 'standard';

-- Create a table to track credit transactions
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'debit' or 'credit'
  operation_type TEXT NOT NULL, -- 'encryption', 'analysis', 'refund', etc.
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on credit_transactions
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for credit_transactions
CREATE POLICY "Users can view their own transactions"
ON public.credit_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
ON public.credit_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to deduct credits
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_operation_type TEXT,
  p_description TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT credits_balance INTO v_current_balance
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- Check if user has enough credits
  IF v_current_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct credits
  UPDATE public.profiles
  SET credits_balance = credits_balance - p_amount
  WHERE user_id = p_user_id;
  
  -- Log transaction
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, operation_type, description)
  VALUES (p_user_id, p_amount, 'debit', p_operation_type, p_description);
  
  RETURN TRUE;
END;
$$;

-- Function to get user credits
CREATE OR REPLACE FUNCTION public.get_user_credits(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  SELECT credits_balance INTO v_balance
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(v_balance, 0);
END;
$$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);