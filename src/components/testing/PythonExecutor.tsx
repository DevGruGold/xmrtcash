import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Play, Code2, CheckCircle2, XCircle } from 'lucide-react';

const EXAMPLE_SCRIPTS = [
  {
    name: 'Parallel Mining & Web Data',
    description: 'Fetch mining stats and web data simultaneously',
    code: `import asyncio

# Parallel execution using asyncio.gather
mining, web = await asyncio.gather(
    tools.get_mining_stats(),
    tools.browse_web("https://supportxmr.com")
)

{
    "mining_hashrate": mining.get("hash", 0),
    "pool_miners": web.get("miners", 0),
    "parallel": True
}`
  },
  {
    name: 'AI Chat with Context',
    description: 'Call ai-chat through Python',
    code: `result = await tools.ai_chat(
    message="What's the current mining status?",
    context={"mode": "python-first"}
)

result`
  },
  {
    name: 'Multi-Step Workflow',
    description: 'Chain multiple edge functions',
    code: `# Step 1: Get mining data
stats = await tools.get_mining_stats()

# Step 2: Analyze with WAN-AI
analysis = await tools.wan_ai_chat(
    messages=[{
        "role": "user",
        "content": f"Analyze mining stats: {stats}"
    }],
    model="qwen-max"
)

# Step 3: Return combined result
{
    "stats": stats,
    "analysis": analysis.get("content", ""),
    "workflow": "complete"
}`
  }
];

export const PythonExecutor: React.FC = () => {
  const [code, setCode] = useState(EXAMPLE_SCRIPTS[0].code);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const executeCode = async () => {
    if (!code.trim()) return;

    setIsExecuting(true);
    setResult(null);
    setError(null);
    setExecutionTime(null);

    try {
      const { data, error: execError } = await supabase.functions.invoke('python-executor', {
        body: {
          code,
          source: 'python-executor-component',
          metadata: {
            timestamp: new Date().toISOString(),
            user_triggered: true
          }
        }
      });

      if (execError) throw execError;

      if (data.status === 'failed') {
        setError(data.error_message);
      } else {
        setResult(data.result);
        setExecutionTime(data.execution_time_ms);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to execute Python code');
    } finally {
      setIsExecuting(false);
    }
  };

  const loadExample = (example: typeof EXAMPLE_SCRIPTS[0]) => {
    setCode(example.code);
    setResult(null);
    setError(null);
    setExecutionTime(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            Python Code Editor
          </CardTitle>
          <CardDescription>
            Execute Python code with access to all Eliza edge functions via the `tools` object
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_SCRIPTS.map((example) => (
              <Button
                key={example.name}
                variant="outline"
                size="sm"
                onClick={() => loadExample(example)}
              >
                {example.name}
              </Button>
            ))}
          </div>

          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter Python code here..."
            className="min-h-[400px] font-mono text-sm"
          />

          <Button
            onClick={executeCode}
            disabled={isExecuting || !code.trim()}
            className="w-full"
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Execute Python
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Execution Result</span>
            {executionTime !== null && (
              <Badge variant="secondary">
                {executionTime}ms
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Output from Python execution with edge function orchestration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                <div className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-destructive mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-destructive mb-2">
                      Execution Failed
                    </h4>
                    <pre className="text-sm text-destructive/90 whitespace-pre-wrap">
                      {error}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="p-4 bg-primary/10 border border-primary rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary mb-2">
                      Success
                    </h4>
                    <pre className="text-sm bg-background/50 p-3 rounded overflow-x-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {!result && !error && !isExecuting && (
              <div className="text-center text-muted-foreground py-12">
                <Code2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Execute Python code to see results</p>
                <p className="text-sm mt-2">
                  Use the `tools` object to call edge functions
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
