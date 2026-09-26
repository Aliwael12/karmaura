-- The repairs feature was removed from the site and the admin. Nothing reads
-- or writes these any more. The table was empty when dropped.
--
-- open_repair returns the table's row type, so it has to go before the table.

drop function if exists public.open_repair(text, text, text, uuid);
drop table if exists public.repairs;
drop function if exists public.next_repair_reference();
drop sequence if exists public.repair_reference_seq;
drop type if exists public.repair_status;
