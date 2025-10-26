/**
 * Python Runtime using Pyodide (WebAssembly Python for Deno)
 * Provides isolated Python execution with access to Eliza edge functions
 */

export class PythonRuntime {
  private pyodide: any = null;
  private supabaseUrl: string;
  private supabaseKey: string;
  private elizaToolsCode: string;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
    this.elizaToolsCode = this.generateElizaToolsLibrary();
  }

  async initialize(): Promise<void> {
    if (this.pyodide) return;

    console.log('🔧 Initializing Pyodide runtime...');
    
    // Load Pyodide from CDN
    const { loadPyodide } = await import('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.mjs');
    
    this.pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
    });

    console.log('✅ Pyodide loaded');

    // Install required packages
    await this.pyodide.loadPackage(['micropip']);
    
    // Set up environment
    this.pyodide.globals.set('SUPABASE_URL', this.supabaseUrl);
    this.pyodide.globals.set('SUPABASE_KEY', this.supabaseKey);

    // Load Eliza tools library
    await this.pyodide.runPythonAsync(this.elizaToolsCode);
    
    console.log('✅ Python runtime ready');
  }

  async execute(code: string): Promise<any> {
    if (!this.pyodide) {
      throw new Error('Python runtime not initialized');
    }

    console.log('🐍 Executing Python code...');

    try {
      // Execute the code
      const result = await this.pyodide.runPythonAsync(code);
      
      // Convert Python objects to JavaScript
      if (result && typeof result.toJs === 'function') {
        return result.toJs({ dict_converter: Object.fromEntries });
      }
      
      return result;
    } catch (error: any) {
      console.error('Python execution error:', error);
      throw new Error(`Python execution failed: ${error.message}`);
    }
  }

  private generateElizaToolsLibrary(): string {
    return `
import json
import js
from pyodide.ffi import to_js
from typing import Any, Optional, Dict

class ElizaTools:
    """
    Python interface to Eliza's edge functions
    Provides access to 100+ edge functions in the XMRT ecosystem
    """
    
    def __init__(self):
        self.supabase_url = js.SUPABASE_URL
        self.supabase_key = js.SUPABASE_KEY
        self.functions_url = f"{self.supabase_url}/functions/v1"
        print(f"🔧 ElizaTools initialized - Functions URL: {self.functions_url}")
    
    async def invoke_function(self, function_name: str, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Call any Supabase edge function"""
        try:
            print(f"📡 Calling edge function: {function_name}")
            
            headers = {
                "Authorization": f"Bearer {self.supabase_key}",
                "Content-Type": "application/json"
            }
            
            body = json.dumps(payload or {})
            
            # Use fetch from JavaScript
            response = await js.fetch(
                f"{self.functions_url}/{function_name}",
                method="POST",
                headers=to_js(headers, dict_converter=js.Object.fromEntries),
                body=body
            )
            
            if not response.ok:
                error_text = await response.text()
                raise Exception(f"Edge function call failed ({response.status}): {error_text}")
            
            result_text = await response.text()
            result = json.loads(result_text)
            
            print(f"✅ Edge function {function_name} completed")
            return result
            
        except Exception as e:
            print(f"❌ Edge function {function_name} failed: {str(e)}")
            raise
    
    async def ai_chat(self, message: str, context: Optional[Dict] = None, conversation_history: Optional[list] = None) -> Dict[str, Any]:
        """Call ai-chat function - Main AI orchestrator"""
        return await self.invoke_function("ai-chat", {
            "userMessage": message,
            "pageContext": context,
            "conversationHistory": conversation_history or []
        })
    
    async def wan_ai_chat(self, messages: list, model: str = "qwen-max", temperature: float = 0.7) -> Dict[str, Any]:
        """Call wan-ai-chat function - Alternative AI using Qwen models"""
        return await self.invoke_function("wan-ai-chat", {
            "messages": messages,
            "model": model,
            "temperature": temperature
        })
    
    async def browse_web(self, url: str, action: Optional[str] = None, extract_content: bool = True) -> Dict[str, Any]:
        """Call playwright-browse function - Web scraping"""
        return await self.invoke_function("playwright-browse", {
            "url": url,
            "action": action,
            "extractContent": extract_content
        })
    
    async def get_mining_stats(self, wallet_address: Optional[str] = None) -> Dict[str, Any]:
        """Call supportxmr-proxy function - Mining pool stats"""
        path = f"/miner/{wallet_address}/stats" if wallet_address else "/pool/stats"
        return await self.invoke_function("supportxmr-proxy", {
            "path": path
        })
    
    async def vectorize_memory(self, memory_id: str) -> Dict[str, Any]:
        """Call vectorize-memory function - Embed memories"""
        return await self.invoke_function("vectorize-memory", {
            "memory_id": memory_id
        })
    
    async def extract_knowledge(self, message_id: str) -> Dict[str, Any]:
        """Call extract-knowledge function - Extract entities"""
        return await self.invoke_function("extract-knowledge", {
            "message_id": message_id
        })
    
    async def text_to_speech(self, text: str, voice: str = "Aria") -> Dict[str, Any]:
        """Call text-to-speech function - ElevenLabs TTS"""
        return await self.invoke_function("text-to-speech", {
            "text": text,
            "voice": voice
        })
    
    async def speech_to_text(self, audio_base64: str) -> Dict[str, Any]:
        """Call speech-to-text function - Audio transcription"""
        return await self.invoke_function("speech-to-text", {
            "audioData": audio_base64
        })
    
    async def ecosystem_webhook(self, event_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Call ecosystem-webhook function - Mesh network operations"""
        return await self.invoke_function("ecosystem-webhook", {
            "eventType": event_type,
            "payload": payload
        })

# Create global instance
tools = ElizaTools()
print("✅ ElizaTools available as 'tools' global variable")
`;
  }
}
