import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0'
import { OpenAI } from 'https://esm.sh/openai@4.49.1'

console.info('Eliza AI Chat — Full Supabase Edge Integration');

const SUPABASE_URL = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY')
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

// --- Supabase client (for Eliza’s own data/memory) ---
const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!)

// --- Dynamic Edge Function Registry ---
async function getSupabaseFunctions() {
  const { data, error } = await supabase.functions.invoke('list-functions', { body: {} })
  if (error) {
    console.warn('Function listing failed, defaulting to static tools:', error.message)
    return [
      {
        type: "function",
        function: {
          name: "exec_python",
          description: "Executes Python code via the python-executor Edge Function.",
          parameters: {
            type: "object",
            properties: { code: { type: "string", description: "Python code to execute" } },
            required: ["code"]
          }
        }
      }
    ]
  }
  return data.map(fn => ({
    type: "function",
    function: {
      name: fn.name,
      description: fn.description || "A Supabase Edge Function callable by Eliza.",
      parameters: { type: "object", properties: { payload: { type: "object" } }, required: ["payload"] }
    }
  }))
}

// --- Fetch Function Helper ---
async function callEdgeFunction(functionName: string, payload: Record<string, unknown>) {
  const url = `${SUPABASE_URL}/functions/v1/${functionName}`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const text = await res.text()
    try { return JSON.parse(text) } catch { return { raw: text } }
  } catch (err) {
    return { error: `Edge call failed for ${functionName}: ${err.message}` }
  }
}

// --- Logging (Eliza’s persistent memory) ---
async function logElizaEvent(user: string, prompt: string, response: string) {
  try {
    await supabase.from('ai_message_log').insert({
      user_id: user,
      user_prompt: prompt,
      ai_response: response,
      timestamp: new Date().toISOString()
    })
  } catch (e) {
    console.warn('Failed to log message:', e)
  }
}

// --- OpenAI Setup ---
const openai = new OpenAI({ apiKey: OPENAI_API_KEY, baseURL: Deno.env.get('OPENAI_BASE_URL') || 'https://api.openai.com/v1' })

async function getAIResponse(prompt: string) {
  const dynamicTools = await getSupabaseFunctions()
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: "You are Eliza, XMRT's autonomous AI. You have access to Supabase Edge Functions and database memory. Decide wisely whether to call tools or reply directly." },
      { role: 'user', content: prompt }
    ],
    tools: dynamicTools,
    tool_choice: 'auto'
  })

  const msg = completion.choices[0].message
  if (msg.tool_calls?.length) {
    const outputs = []
    for (const call of msg.tool_calls) {
      const args = JSON.parse(call.function.arguments)
      const result = await callEdgeFunction(call.function.name, args.payload || args)
      outputs.push({ function: call.function.name, result })
    }

    const final = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        ...completion.choices[0].message,
        { role: 'tool', content: JSON.stringify(outputs) }
      ]
    })
    return final.choices[0].message.content
  }

  return msg.content
}

// --- Main Handler ---
Deno.serve(async (req) => {
  if (req.method === 'GET') return new Response('Eliza AI online ✅', { status: 200 })
  if (req.method !== 'POST') return new Response('Only POST allowed', { status: 405 })

  const body = await req.json()
  const user = body.user_id || 'anonymous'
  const prompt = body.text || body.query || ''

  const aiResponse = await getAIResponse(prompt)
  await logElizaEvent(user, prompt, aiResponse)

  return new Response(JSON.stringify({ ok: true, ai_response: aiResponse }), {
    status: 200, headers: { 'Content-Type': 'application/json' }
  })
})
