
/**
 * Tez Net Measurement Engine
 */

interface SpeedTestHooks {
  onPing?: (ping: number, jitter: number) => void;
  onDownloadProgress: (speed: number) => void;
  onDownloadComplete: (finalSpeed: number) => void;
  onUploadProgress?: (speed: number) => void;
  onUploadComplete?: (finalSpeed: number) => void;
}

// Reliable public endpoints
const CLOUDFLARE_URL = 'https://speed.cloudflare.com';

export const startSpeedTest = async (hooks: SpeedTestHooks) => {
  // 1. PING & JITTER
  const pings: number[] = [];
  for (let i = 0; i < 5; i++) {
    const start = performance.now();
    try {
      await fetch(`${CLOUDFLARE_URL}/__ping`, { 
        cache: 'no-store', 
        mode: 'no-cors'
      });
      pings.push(performance.now() - start);
    } catch {
      pings.push(60); 
    }
  }
  const avgPing = pings.reduce((a, b) => a + b) / pings.length;
  const jitter = Math.max(...pings) - Math.min(...pings);
  hooks.onPing?.(avgPing, jitter);

  // 2. DOWNLOAD TEST
  try {
    await runDownloadTest(hooks);
  } catch (e) {
    console.error("Download Error:", e);
    throw e;
  }

  // 3. UPLOAD TEST
  if (hooks.onUploadProgress && hooks.onUploadComplete) {
    try {
      await runUploadTest(hooks);
    } catch (e) {
      console.error("Upload Error:", e);
      hooks.onUploadComplete(0);
    }
  }
};

export async function runDownloadTest(hooks: SpeedTestHooks) {
  const duration = 10000; 
  const start = performance.now();
  let totalBytes = 0;
  
  // Use a large chunk size for the download
  const testUrl = `${CLOUDFLARE_URL}/__down?bytes=${150 * 1024 * 1024}`;
  
  try {
    const response = await fetch(testUrl, { 
      cache: 'no-store',
      mode: 'cors'
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Body reader unavailable');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      if (value) totalBytes += value.length;
      
      const elapsed = (performance.now() - start) / 1000;
      if (elapsed > 0) {
        const speedMbps = (totalBytes * 8) / (elapsed * 1000000);
        hooks.onDownloadProgress(speedMbps);
      }

      if (performance.now() - start > duration) {
        await reader.cancel();
        break;
      }
    }
  } catch (e: any) {
    throw e;
  }

  const finalElapsed = (performance.now() - start) / 1000;
  hooks.onDownloadComplete(finalElapsed > 0 ? (totalBytes * 8) / (finalElapsed * 1000000) : 0);
}

async function runUploadTest(hooks: SpeedTestHooks) {
  const duration = 8000;
  const start = performance.now();
  let totalBytesUploaded = 0;
  
  // Use a larger chunk size (2MB) for efficiency. 
  // We fill it in 64KB increments to stay within Crypto.getRandomValues limits.
  const CHUNK_SIZE_BYTES = 2 * 1024 * 1024;
  const chunk = new Uint8Array(CHUNK_SIZE_BYTES);
  for (let i = 0; i < chunk.length; i += 65536) {
    const size = Math.min(65536, chunk.length - i);
    window.crypto.getRandomValues(chunk.subarray(i, i + size));
  }

  const runIteration = (): Promise<void> => {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      // Using /__up endpoint which is standard for Cloudflare speed testing
      xhr.open('POST', `${CLOUDFLARE_URL}/__up`, true);
      
      xhr.upload.onprogress = (e) => {
        const elapsed = (performance.now() - start) / 1000;
        if (elapsed > 0) {
          const currentSpeed = ((totalBytesUploaded + e.loaded) * 8) / (elapsed * 1000000);
          hooks.onUploadProgress?.(currentSpeed);
        }
        
        if (performance.now() - start > duration) {
          xhr.abort();
          resolve();
        }
      };

      xhr.onload = () => {
        totalBytesUploaded += CHUNK_SIZE_BYTES;
        if (performance.now() - start < duration) {
          runIteration().then(resolve);
        } else {
          resolve();
        }
      };

      xhr.onerror = () => resolve();
      xhr.send(chunk);
    });
  };

  await runIteration();
  const finalElapsed = (performance.now() - start) / 1000;
  hooks.onUploadComplete?.(finalElapsed > 0 ? (totalBytesUploaded * 8) / (finalElapsed * 1000000) : 0);
}

export const getIpInfo = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('IP lookup failed');
    return await response.json();
  } catch (e) {
    return { 
      ip: '...', 
      org: 'Detecting ISP...', 
      city: 'Unknown Location', 
      country_name: '',
      region: ''
    };
  }
};
