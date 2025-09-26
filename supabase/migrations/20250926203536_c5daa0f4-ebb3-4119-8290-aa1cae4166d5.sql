-- Update the sender check constraint to allow 'assistant'
ALTER TABLE public.chat_messages 
DROP CONSTRAINT IF EXISTS chat_messages_sender_check;

ALTER TABLE public.chat_messages 
ADD CONSTRAINT chat_messages_sender_check 
CHECK (sender IN ('user', 'assistant'));