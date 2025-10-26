# Python-First Architecture

## Overview

Eliza now operates on a **Python-first architecture** where all edge function orchestration can be routed through a Python executor. This enables advanced capabilities like parallel processing, complex workflows, and sophisticated error handling.

## Architecture Components

### 1. Python Executor Edge Function
**Location:** `supabase/functions/python-executor/`

**Structure:**
```
python-executor/
├── index.ts           # Main handler
├── types.ts           # TypeScript interfaces
└── python-runtime.ts  # Pyodide integration with ElizaTools
```

**Capabilities:**
- Executes Python code in isolated Pyodide environment
- Logs all executions to `eliza_python_executions` table
- Provides `ElizaTools` library for edge function access
- Handles timeouts, errors, and result serialization

### 2. ElizaTools Python Library

Available globally as `tools` in Python code:

```python
# Main AI orchestration
await tools.ai_chat(message, context, conversation_history)
await tools.wan_ai_chat(messages, model, temperature)

# Data gathering
await tools.get_mining_stats(wallet_address)
await tools.browse_web(url, action, extract_content)

# Memory & knowledge
await tools.vectorize_memory(memory_id)
await tools.extract_knowledge(message_id)

# Voice processing
await tools.text_to_speech(text, voice)
await tools.speech_to_text(audio_base64)

# Mesh network
await tools.ecosystem_webhook(event_type, payload)

# Generic invocation
await tools.invoke_function(function_name, payload)
```

### 3. AI Integration

The `ai-chat` edge function now has an `execute_python` tool that allows Eliza to generate and run Python code dynamically:

```typescript
{
  type: "function",
  function: {
    name: "execute_python",
    description: "Execute Python code to orchestrate complex operations...",
    parameters: {
      code: "Python code with access to ElizaTools",
      workflow_id: "Optional tracking ID"
    }
  }
}
```

### 4. Frontend Integration

#### Option A: Direct Python Execution
Use `PythonExecutor` component for testing:
```tsx
import { PythonExecutor } from '@/components/testing/PythonExecutor';
```

#### Option B: Python-First Chat
Use `usePythonChat` hook:
```tsx
const { messages, sendMessage, isLoading } = usePythonChat({
  pythonFirst: true
});
```

#### Option C: Conditional Python Mode
The standard `usePersistentChat` has a flag for Python-first:
```typescript
// In usePersistentChat.ts (line 114)
const usePythonFirst = false; // Toggle to enable
```

## Use Cases

### 1. Parallel Data Gathering
```python
import asyncio

# Fetch multiple data sources simultaneously
mining, web, memory = await asyncio.gather(
    tools.get_mining_stats(),
    tools.browse_web("https://supportxmr.com"),
    tools.invoke_function("match_memories", {"query": "mining"})
)

{"mining": mining, "web": web, "memory": memory}
```

### 2. Conditional Workflows
```python
# Multi-step with conditional logic
stats = await tools.get_mining_stats()

if stats.get("hash", 0) > 1000:
    # High hashrate - get detailed analysis
    analysis = await tools.wan_ai_chat([{
        "role": "user",
        "content": f"Analyze high hashrate: {stats}"
    }])
else:
    # Low hashrate - check pool status
    pool = await tools.browse_web("https://supportxmr.com/api/pool/stats")
    analysis = {"message": "Hashrate below threshold", "pool": pool}

{"stats": stats, "analysis": analysis}
```

### 3. Error Handling with Fallbacks
```python
import asyncio

# Try OpenAI first, fallback to WAN-AI
try:
    result = await tools.ai_chat("Analyze this", context)
except Exception as e:
    print(f"OpenAI failed: {e}, falling back to WAN-AI")
    result = await tools.wan_ai_chat([
        {"role": "user", "content": "Analyze this"}
    ])

result
```

### 4. Data Transformation
```python
# Get mining data and transform it
raw_stats = await tools.get_mining_stats()

# Process and format
processed = {
    "hashrate_khs": raw_stats.get("hash", 0) / 1000,
    "xmr_pending": raw_stats.get("amtDue", 0) / 1e12,
    "efficiency": raw_stats.get("validShares", 0) / max(raw_stats.get("totalShares", 1), 1),
    "timestamp": raw_stats.get("timestamp")
}

processed
```

## Database Schema

All Python executions are logged in `eliza_python_executions`:

```sql
CREATE TABLE eliza_python_executions (
  id UUID PRIMARY KEY,
  code TEXT NOT NULL,
  status TEXT NOT NULL, -- 'running', 'completed', 'failed'
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ,
  result JSONB,
  error_message TEXT,
  exit_code INTEGER,
  source TEXT, -- 'ai-chat', 'direct', 'python-chat-hook'
  workflow_id UUID,
  metadata JSONB
);
```

## Performance Considerations

- **Pyodide Initialization:** ~500ms (cached after first load)
- **Python Execution Overhead:** ~50-100ms
- **Edge Function Calls:** 100-500ms each
- **Parallel Execution:** Can reduce total latency by running operations simultaneously

## Security

- Python execution sandboxed (no file system access)
- Network limited to Supabase edge functions
- 30-second timeout limit
- 50MB memory limit
- All executions logged for auditing

## Future Enhancements

1. **Pre-built Workflows:** Library of common Python scripts
2. **Script Versioning:** Track evolution of Python orchestrations
3. **Performance Caching:** Cache frequently-used results
4. **A/B Testing:** Compare different orchestration strategies
5. **Visual Workflow Builder:** No-code Python workflow creation
6. **Real-time Streaming:** Stream Python execution progress

## Testing

Use the `PythonExecutor` component to test Python code:

1. Navigate to testing page
2. Load an example script
3. Modify as needed
4. Click "Execute Python"
5. View results and execution time

## Troubleshooting

### Common Issues

1. **"Python runtime not initialized"**
   - Pyodide failed to load
   - Check network connectivity
   - Verify CDN access

2. **"Edge function call failed"**
   - Check function name spelling
   - Verify payload structure
   - Review edge function logs

3. **"Execution timeout"**
   - Simplify code
   - Reduce edge function calls
   - Use parallel execution

### Debug Tips

- Check `eliza_python_executions` table for detailed logs
- Use `print()` statements in Python code
- Test edge functions individually first
- Start with simple examples, then increase complexity

## Migration Path

**Phase 1 (Current):** Python executor available, AI can use it
**Phase 2:** Frontend Python-first mode enabled
**Phase 3:** Pre-built workflows and templates
**Phase 4:** Visual workflow builder

## Documentation Links

- [Pyodide Documentation](https://pyodide.org/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Python asyncio](https://docs.python.org/3/library/asyncio.html)
