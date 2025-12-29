
export type TestStage = 'idle' | 'ping' | 'download' | 'upload' | 'completed';

export interface TestResults {
  ping: number;
  jitter: number;
  download: number;
  upload: number;
  timestamp: number;
  server?: string;
}

export interface HistoryItem extends TestResults {
  id: string;
}

export interface SpeedMetrics {
  currentSpeed: number;
  progress: number; // 0 to 100
}

export interface IPInfo {
  ip: string;
  org: string;
  city: string;
  country_name: string;
  region: string;
}
