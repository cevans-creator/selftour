-- Add access_code_failed event type for tracking lock code failures
ALTER TYPE "tour_event_type" ADD VALUE IF NOT EXISTS 'access_code_failed';
