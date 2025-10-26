export interface PythonExecutionRequest {
  code: string;
  workflow_id?: string;
  source?: string;
  metadata?: Record<string, any>;
}

export interface PythonExecutionResponse {
  execution_id: string;
  status: 'completed' | 'failed';
  result: any;
  error_message: string | null;
  exit_code: number;
  execution_time_ms: number;
}

export interface ElizaToolsConfig {
  supabase_url: string;
  supabase_key: string;
}
