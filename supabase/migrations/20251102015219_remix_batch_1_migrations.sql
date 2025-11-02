
-- Migration: 20251102012714

-- Migration: 20251102011828

-- Migration: 20251102005507

-- Migration: 20251102005349

-- Migration: 20251101221509
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  plan_status TEXT NOT NULL DEFAULT 'trial' CHECK (plan_status IN ('trial', 'basic', 'pro')),
  theme_preference TEXT DEFAULT 'dark' CHECK (theme_preference IN ('light', 'dark'))
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create scripts_protected table for metrics
CREATE TABLE public.scripts_protected (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  script_name TEXT NOT NULL,
  original_size INTEGER,
  encrypted_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending'))
);

ALTER TABLE public.scripts_protected ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scripts" 
ON public.scripts_protected 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scripts" 
ON public.scripts_protected 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scripts" 
ON public.scripts_protected 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scripts" 
ON public.scripts_protected 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own logs" 
ON public.activity_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own logs" 
ON public.activity_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, company_name, age, theme_preference)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'Company'),
    COALESCE((NEW.raw_user_meta_data->>'age')::integer, 18),
    COALESCE(NEW.raw_user_meta_data->>'theme_preference', 'dark')
  );

  -- Log the signup event
  INSERT INTO public.activity_logs (user_id, event_type, description)
  VALUES (NEW.id, 'signup', 'Nova conta criada com sucesso');

  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Migration: 20251102004100
-- Create license_keys table for key management
CREATE TABLE public.license_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  key_name TEXT NOT NULL,
  public_key TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY;

-- Create policies for license_keys
CREATE POLICY "Users can view their own keys" 
ON public.license_keys 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own keys" 
ON public.license_keys 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own keys" 
ON public.license_keys 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own keys" 
ON public.license_keys 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_license_keys_updated_at
BEFORE UPDATE ON public.license_keys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();




-- Migration: 20251102011958
-- Adicionar coluna scripts_vinculados à tabela license_keys
ALTER TABLE public.license_keys 
ADD COLUMN IF NOT EXISTS scripts_vinculados JSONB DEFAULT '[]'::jsonb;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.license_keys.scripts_vinculados IS 'Array JSON de IDs de scripts_protected que usam esta chave';

-- Migration: 20251102012518
-- Adicionar coluna status_encryption à tabela scripts_protected para rastreamento de status de criptografia
ALTER TABLE public.scripts_protected 
ADD COLUMN IF NOT EXISTS status_encryption TEXT DEFAULT 'success' CHECK (status_encryption IN ('success', 'pending', 'failed'));

-- Atualizar status de scripts existentes para 'success'
UPDATE public.scripts_protected SET status_encryption = 'success' WHERE status_encryption IS NULL;

-- Comentário explicativo
COMMENT ON COLUMN public.scripts_protected.status_encryption IS 'Status da criptografia: success (verde), pending (laranja), failed (vermelho)';

