-- Migration: Bookings-Events Integration
-- This script implements the database schema changes needed for the Bookings-Events integration

-- Start transaction
BEGIN;

-- 1. Modify existing tables

-- 1.1. Update bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS event_generation_status TEXT,
ADD COLUMN IF NOT EXISTS event_count INTEGER,
ADD COLUMN IF NOT EXISTS last_event_generated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS series_start_date DATE,
ADD COLUMN IF NOT EXISTS series_end_date DATE;

-- 1.2. Update activities table
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS event_instance_id UUID,
ADD COLUMN IF NOT EXISTS preparation_status TEXT,
ADD COLUMN IF NOT EXISTS execution_status TEXT,
ADD COLUMN IF NOT EXISTS completion_notes TEXT,
ADD COLUMN IF NOT EXISTS target_metrics JSONB,
ADD COLUMN IF NOT EXISTS actual_metrics JSONB;

-- 2. Create new tables

-- 2.1. Create event_instances table
CREATE TABLE IF NOT EXISTS event_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location_id UUID,
  status TEXT NOT NULL DEFAULT 'scheduled',
  field_manager_id UUID,
  preparation_status TEXT,
  check_in_required BOOLEAN DEFAULT TRUE,
  notes TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.2. Create event_team_members table
CREATE TABLE IF NOT EXISTS event_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_instance_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_instance_id, user_id, role)
);

-- 2.3. Create staff_assignments table
CREATE TABLE IF NOT EXISTS staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_instance_id UUID NOT NULL,
  activity_id UUID,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'assigned',
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  location_at_check_in JSONB,
  location_at_check_out JSONB,
  hours_worked DECIMAL(5,2),
  feedback TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.4. Create activity_kits table
CREATE TABLE IF NOT EXISTS activity_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL,
  kit_template_id UUID,
  kit_instance_id UUID,
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'needed',
  checked_out_by UUID,
  checked_out_at TIMESTAMP,
  returned_by UUID,
  returned_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.5. Create event_state_transitions table
CREATE TABLE IF NOT EXISTS event_state_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_instance_id UUID NOT NULL,
  from_state TEXT NOT NULL,
  to_state TEXT NOT NULL,
  changed_by_id UUID,
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.6. Create event_issues table
CREATE TABLE IF NOT EXISTS event_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_instance_id UUID NOT NULL,
  activity_id UUID,
  reported_by UUID NOT NULL,
  issue_type TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  resolution TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMP,
  photo_urls TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Add foreign key constraints

-- 3.1. event_instances foreign keys
ALTER TABLE event_instances
ADD CONSTRAINT fk_event_instances_booking_id 
FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_event_instances_location_id 
FOREIGN KEY (location_id) REFERENCES locations(id),
ADD CONSTRAINT fk_event_instances_field_manager_id 
FOREIGN KEY (field_manager_id) REFERENCES users(id);

-- 3.2. activities foreign keys
ALTER TABLE activities
ADD CONSTRAINT fk_activities_event_instance_id 
FOREIGN KEY (event_instance_id) REFERENCES event_instances(id);

-- 3.3. event_team_members foreign keys
ALTER TABLE event_team_members
ADD CONSTRAINT fk_event_team_members_event_instance_id 
FOREIGN KEY (event_instance_id) REFERENCES event_instances(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_event_team_members_user_id 
FOREIGN KEY (user_id) REFERENCES users(id);

-- 3.4. staff_assignments foreign keys
ALTER TABLE staff_assignments
ADD CONSTRAINT fk_staff_assignments_event_instance_id 
FOREIGN KEY (event_instance_id) REFERENCES event_instances(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_staff_assignments_activity_id 
FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_staff_assignments_user_id 
FOREIGN KEY (user_id) REFERENCES users(id);

-- 3.5. activity_kits foreign keys
ALTER TABLE activity_kits
ADD CONSTRAINT fk_activity_kits_activity_id 
FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_activity_kits_kit_template_id 
FOREIGN KEY (kit_template_id) REFERENCES kit_templates(id),
ADD CONSTRAINT fk_activity_kits_kit_instance_id 
FOREIGN KEY (kit_instance_id) REFERENCES kit_instances(id),
ADD CONSTRAINT fk_activity_kits_checked_out_by 
FOREIGN KEY (checked_out_by) REFERENCES users(id),
ADD CONSTRAINT fk_activity_kits_returned_by 
FOREIGN KEY (returned_by) REFERENCES users(id);

-- 3.6. event_state_transitions foreign keys
ALTER TABLE event_state_transitions
ADD CONSTRAINT fk_event_state_transitions_event_instance_id 
FOREIGN KEY (event_instance_id) REFERENCES event_instances(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_event_state_transitions_changed_by_id 
FOREIGN KEY (changed_by_id) REFERENCES users(id);

-- 3.7. event_issues foreign keys
ALTER TABLE event_issues
ADD CONSTRAINT fk_event_issues_event_instance_id 
FOREIGN KEY (event_instance_id) REFERENCES event_instances(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_event_issues_activity_id 
FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_event_issues_reported_by 
FOREIGN KEY (reported_by) REFERENCES users(id),
ADD CONSTRAINT fk_event_issues_resolved_by 
FOREIGN KEY (resolved_by) REFERENCES users(id);

-- 4. Create indexes for performance

-- 4.1. event_instances indexes
CREATE INDEX IF NOT EXISTS idx_event_instances_booking_id ON event_instances(booking_id);
CREATE INDEX IF NOT EXISTS idx_event_instances_date ON event_instances(date);
CREATE INDEX IF NOT EXISTS idx_event_instances_status ON event_instances(status);
CREATE INDEX IF NOT EXISTS idx_event_instances_field_manager_id ON event_instances(field_manager_id);

-- 4.2. event_team_members indexes
CREATE INDEX IF NOT EXISTS idx_event_team_members_event_instance_id ON event_team_members(event_instance_id);
CREATE INDEX IF NOT EXISTS idx_event_team_members_user_id ON event_team_members(user_id);

-- 4.3. staff_assignments indexes
CREATE INDEX IF NOT EXISTS idx_staff_assignments_event_instance_id ON staff_assignments(event_instance_id);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_activity_id ON staff_assignments(activity_id);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_user_id ON staff_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_status ON staff_assignments(status);

-- 4.4. activity_kits indexes
CREATE INDEX IF NOT EXISTS idx_activity_kits_activity_id ON activity_kits(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_kits_kit_template_id ON activity_kits(kit_template_id);
CREATE INDEX IF NOT EXISTS idx_activity_kits_kit_instance_id ON activity_kits(kit_instance_id);
CREATE INDEX IF NOT EXISTS idx_activity_kits_status ON activity_kits(status);

-- 4.5. event_state_transitions indexes
CREATE INDEX IF NOT EXISTS idx_event_state_transitions_event_instance_id ON event_state_transitions(event_instance_id);
CREATE INDEX IF NOT EXISTS idx_event_state_transitions_created_at ON event_state_transitions(created_at);

-- 4.6. event_issues indexes
CREATE INDEX IF NOT EXISTS idx_event_issues_event_instance_id ON event_issues(event_instance_id);
CREATE INDEX IF NOT EXISTS idx_event_issues_activity_id ON event_issues(activity_id);
CREATE INDEX IF NOT EXISTS idx_event_issues_status ON event_issues(status);
CREATE INDEX IF NOT EXISTS idx_event_issues_severity ON event_issues(severity);

-- 5. Create functions and triggers for state management

-- 5.1. Function to log event state transitions
CREATE OR REPLACE FUNCTION log_event_state_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO event_state_transitions
      (event_instance_id, from_state, to_state, changed_by_id)
    VALUES
      (NEW.id, OLD.status, NEW.status, current_setting('app.current_user_id', true)::uuid);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5.2. Trigger for event state transitions
DROP TRIGGER IF EXISTS event_state_transition_trigger ON event_instances;
CREATE TRIGGER event_state_transition_trigger
AFTER UPDATE OF status ON event_instances
FOR EACH ROW
EXECUTE FUNCTION log_event_state_transition();

-- 5.3. Function to update booking status when all events are completed
CREATE OR REPLACE FUNCTION update_booking_status_on_event_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_events INTEGER;
  completed_events INTEGER;
  booking_id UUID;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    booking_id := NEW.booking_id;
    
    -- Count total events for this booking
    SELECT COUNT(*) INTO total_events
    FROM event_instances
    WHERE booking_id = NEW.booking_id;
    
    -- Count completed events for this booking
    SELECT COUNT(*) INTO completed_events
    FROM event_instances
    WHERE booking_id = NEW.booking_id
    AND status = 'completed';
    
    -- If all events are completed, update booking status
    IF total_events = completed_events THEN
      UPDATE bookings
      SET status = 'completed'
      WHERE id = booking_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5.4. Trigger for updating booking status
DROP TRIGGER IF EXISTS event_completion_trigger ON event_instances;
CREATE TRIGGER event_completion_trigger
AFTER UPDATE OF status ON event_instances
FOR EACH ROW
EXECUTE FUNCTION update_booking_status_on_event_completion();

-- 5.5. Function to update event_instance.updated_at on any change
CREATE OR REPLACE FUNCTION update_event_instance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5.6. Trigger for updating event_instance timestamp
DROP TRIGGER IF EXISTS event_instance_update_timestamp_trigger ON event_instances;
CREATE TRIGGER event_instance_update_timestamp_trigger
BEFORE UPDATE ON event_instances
FOR EACH ROW
EXECUTE FUNCTION update_event_instance_timestamp();

-- Commit transaction
COMMIT;