-- Check if the table already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = 'user_permissions'
  ) THEN
    -- Create the user_permissions table
    CREATE TABLE user_permissions (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id),
      permission TEXT NOT NULL,
      granted BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    
    -- Create index on user_id and permission for faster lookups
    CREATE INDEX idx_user_permission ON user_permissions(user_id, permission);
    
    RAISE NOTICE 'user_permissions table created successfully';
  ELSE
    RAISE NOTICE 'user_permissions table already exists, skipping creation';
  END IF;
END
$$;

-- Create function to check for permissions
CREATE OR REPLACE FUNCTION check_user_permission(p_user_id UUID, p_permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_granted BOOLEAN;
  v_role TEXT;
BEGIN
  -- First check for custom permission override
  SELECT granted INTO v_granted
  FROM user_permissions
  WHERE user_id = p_user_id AND permission = p_permission;
  
  -- If a custom permission was found, return it
  IF FOUND THEN
    RETURN v_granted;
  END IF;
  
  -- Otherwise, use the role-based default (stub for now)
  -- In a real implementation, this would check the role's permissions
  SELECT role INTO v_role FROM users WHERE id = p_user_id;
  
  -- Default permissions logic would go here
  -- For now, just return false as a placeholder
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;