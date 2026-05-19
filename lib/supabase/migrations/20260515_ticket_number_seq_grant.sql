-- Fix: authenticated role needs USAGE on the ticket_number identity sequence
GRANT USAGE, SELECT ON SEQUENCE tickets_number_seq TO authenticated;
