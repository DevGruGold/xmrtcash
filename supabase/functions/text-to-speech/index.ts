import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice = 'Aria' } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!ELEVENLABS_API_KEY) {
      console.error('⚠️ ELEVENLABS_API_KEY not configured - TTS unavailable');
      return new Response(
        JSON.stringify({ 
          error: 'TTS service unavailable',
          details: 'ELEVENLABS_API_KEY not configured in Supabase secrets',
          fallback: 'Please add your ElevenLabs API key to enable text-to-speech'
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating speech for text:', text.substring(0, 100));

    // Voice ID mapping
    const voiceIds: { [key: string]: string } = {
      'Aria': '9BWtsMINqrJLrRacOk9x',
      'Sarah': 'EXAVITQu4vr4xnSDxMaL',
      'Charlotte': 'XB0fDUnXU5powFXDhCwa',
      'Alice': 'Xb7hH8MSUJpSbSDYk0k2',
      'Jessica': 'cgSgspJ2msm6clMCkdW9'
    };

    const voiceId = voiceIds[voice] || voiceIds['Aria'];

    // Generate speech using ElevenLabs
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.5,
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Convert audio buffer to base64
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Process in chunks to avoid stack overflow
    let binaryString = '';
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      binaryString += String.fromCharCode(...chunk);
    }
    
    const base64Audio = btoa(binaryString);

    console.log('Successfully generated audio, size:', arrayBuffer.byteLength);

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error: any) {
    console.error('Error in text-to-speech function:', error);
    const errorMessage = error?.message || String(error) || 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate speech',
        details: errorMessage
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});