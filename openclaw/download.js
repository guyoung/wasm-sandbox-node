import { createWriteStream, existsSync, statSync, mkdirSync, unlinkSync } from 'fs';
import { dirname, resolve } from 'path';
import { URL } from 'url';
import http from 'http';
import https from 'https';


import { DownloadOptionSchema } from './schema'

function getCurrentFileSize(filePath) {
  try {
    if (existsSync(filePath)) {
      return statSync(filePath).size;
    }
  } catch {}
  return 0;
}

function getFileSizeFromHeaders(headers) {
  const contentLength = headers['content-length'];
  if (contentLength) {
    return parseInt(contentLength, 10);
  }
  return null;
}

function supportsResume(headers) {
  const acceptRanges = headers['accept-ranges'];
  const contentRange = headers['content-range'];
  return acceptRanges === 'bytes' || (contentRange && contentRange.includes('bytes'));
}

function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = client.request(requestOptions, (res) => {
      resolve(res);
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function downloadWithProgress(url, outputPath, options = {}) {
  const {
    resume = true,
    timeout = 300000,
    headers = {},
    onProgress,
  } = options;

  let currentSize = getCurrentFileSize(outputPath);
  const file = createWriteStream(outputPath, { flags: currentSize > 0 && resume ? 'a' : 'w' });

  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const requestHeaders = { ...headers };
    let lastByte = 0;

    // Resume: add Range header if file exists
    if (resume && currentSize > 0) {
      requestHeaders['Range'] = `bytes=${currentSize}-`;
    }

    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: currentSize > 0 && resume ? 'GET' : 'GET',
      headers: requestHeaders,
    };

    const req = client.request(requestOptions, (res) => {
      const statusCode = res.statusCode;

      // Handle redirect
      if (statusCode === 301 || statusCode === 302 || statusCode === 303 || statusCode === 307 || statusCode === 308) {
        const redirectUrl = res.headers.location;
        if (redirectUrl) {
          res.destroy();
          file.close();
          resolve(downloadWithProgress(redirectUrl, outputPath, options));
          return;
        }
      }

      // Handle partial content (resume successful)
      if (statusCode === 206) {
        const contentRange = res.headers['content-range'];
        if (contentRange) {
          const totalSize = parseInt(contentRange.split('/')[1], 10);
          currentSize = totalSize;
        }
      }

      // Handle full content requested but partial exists (server doesn't support resume)
      if ((statusCode === 200 || statusCode === 206) && currentSize > 0 && statusCode === 200) {
        // Server doesn't support resume, file will be overwritten
        if (existsSync(outputPath)) {
          unlinkSync(outputPath);
        }
        file.close();
        file = createWriteStream(outputPath);
        currentSize = 0;
      }

      let downloadedSize = currentSize;
      const contentLength = getFileSizeFromHeaders(res.headers) || 0;
      const totalSize = currentSize + contentLength;

      res.on('data', (chunk) => {
        downloadedSize += chunk.length;
        file.write(chunk);
        if (onProgress) {
          onProgress({
            downloaded: downloadedSize,
            total: totalSize,
            chunkSize: chunk.length,
          });
        }
      });

      res.on('end', () => {
        file.end();
        const finalSize = getCurrentFileSize(outputPath);
        resolve({
          success: true,
          httpCode: statusCode,
          fileSize: finalSize,
          downloadedBytes: finalSize - currentSize,
          resumeUsed: statusCode === 206,
        });
      });

      res.on('error', (err) => {
        file.end();
        reject(err);
      });
    });

    req.on('error', (err) => {
      file.end();
      reject(err);
    });

    req.setTimeout(timeout, () => {
      req.destroy();
      file.end();
      reject(new Error(`Download timeout after ${timeout}ms`));
    });

    req.end();
  });
}

export function createDownloadTool(api) {
  return {
    name: 'wasm-sandbox-download',
    label: 'Wasm Sandbox File Download',
    description: 'Download a file from a URL with resume and retry support. ',
    parameters: DownloadOptionSchema,
    execute: async (toolCallId, rawParams) => {
      const {
        url,
        output,
        retry = 3,
        resume = true,
        timeout = 300000,
        headers = {},
      } = rawParams;

      // Resolve output path
      let outputPath = output;
      if (!outputPath.startsWith('/')) {
        outputPath = `/home/user/.openclaw/workspace/${outputPath}`;
      }

      // Ensure output directory exists
      try {
        mkdirSync(dirname(outputPath), { recursive: true });
      } catch (e) {
        // Directory might already exist
      }

      let lastError = null;
      let downloadedBytes = 0;
      let finalSize = 0;
      let httpCode = 0;
      let resumeUsed = false;
      const startTime = Date.now();

      for (let attempt = 0; attempt <= retry; attempt++) {
        try {
          if (attempt > 0) {
            api.logger?.debug(`Retry attempt ${attempt}/${retry}`);
          }

          const result = await downloadWithProgress(url, outputPath, {
            resume: resume && attempt === 0,
            timeout,
            headers,
            onProgress: (progress) => {
              downloadedBytes = progress.downloaded;
            },
          });

          downloadedBytes = result.downloadedBytes;
          finalSize = result.fileSize;
          httpCode = result.httpCode;
          resumeUsed = result.resumeUsed;
          lastError = null;
          break;
        } catch (err) {
          lastError = err;
          downloadedBytes = getCurrentFileSize(outputPath);

          // Don't retry on certain errors
          if (err.message?.includes('404') || err.message?.includes('403')) {
            break;
          }
        }
      }

      const elapsedMs = Date.now() - startTime;

      if (lastError) {
        const partialSize = getCurrentFileSize(outputPath);
        if (partialSize > 0 && resume) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: false,
                partial: true,
                downloadedBytes: partialSize,
                message: `Download failed after ${retry + 1} attempts. Partial file exists (${partialSize} bytes).`,
                error: lastError.message,
                retryAttempts: retry,
              }, null, 2),
            }],
          };
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: lastError.message,
              httpCode,
              retryAttempts: retry,
            }, null, 2),
          }],
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            url,
            output: outputPath,
            fileSize: finalSize,
            downloadedBytes,
            httpCode,
            elapsedMs,
            resumeUsed,
            message: `Download completed: ${outputPath} (${finalSize} bytes) in ${Math.round(elapsedMs / 1000)}s`,
          }, null, 2),
        }],
      };
    },
  };
}



export function registerDownloadCli({ root }) {
  root
    .command('download')
    .description('Download a file with resume and retry support using native Node.js http/https')
    .argument('<url>', 'URL of the file to download')
    .argument('<output>', 'Output file path')
    .option('-r, --retry <n>', 'Number of retry attempts (default: 3)', parseInt)
    .option('--no-resume', 'Disable resume for interrupted downloads')
    .option('-t, --timeout <seconds>', 'Download timeout in seconds (default: 300)', parseInt)
    .option('--expected-size <bytes>', 'Expected file size for resume validation', parseInt)
    .option('-H, --header <header>', 'Custom HTTP header (can be repeated)', (value) => value)
    .action(async (url, output, opts) => {
      const retry = opts.retry ?? 3;
      const resume = opts.resume !== false;
      const timeoutMs = (opts.timeout ?? 300) * 1000;

      // Parse custom headers
      const headers = {};
      if (opts.header) {
        const headerList = Array.isArray(opts.header) ? opts.header : [opts.header];
        headerList.forEach((h) => {
          const [key, value] = h.split(':');
          if (key && value) {
            headers[key.trim()] = value.trim();
          }
        });
      }

      let lastError = null;
      let currentSize = existsSync(output) ? statSync(output).size : 0;

      for (let attempt = 0; attempt <= retry; attempt++) {
        try {
          if (attempt > 0) {
            console.log(`Retry attempt ${attempt}/${retry}...`);
          }

          const result = await downloadFile(url, output, {
            resume: resume && attempt === 0,
            timeout: timeoutMs,
            headers,
            startBytes: currentSize,
          });

          console.log(`Download completed: ${output} (${result.fileSize} bytes)${result.resumeUsed ? ' (resumed)' : ''}`);
          console.log(`HTTP ${result.httpCode} | ${result.elapsedMs}ms`);
          return;
        } catch (err) {
          lastError = err;
          currentSize = existsSync(output) ? statSync(output).size : 0;

          if (err.message?.includes('404') || err.message?.includes('403')) {
            console.error(`Download failed: ${err.message}`);
            process.exit(1);
          }

          if (attempt < retry) {
            console.log(`Attempt ${attempt + 1} failed: ${err.message}. Retrying...`);
          }
        }
      }

      console.error(`Download failed after ${retry + 1} attempts.`);
      if (lastError) {
        console.error(`Last error: ${lastError.message}`);
      }
      if (currentSize > 0) {
        console.error(`Partial file exists: ${currentSize} bytes at ${output}`);
      }
      process.exit(1);
    });
}

function downloadFile(url, outputPath, options = {}) {
  const { resume = true, timeout = 300000, headers = {}, startBytes = 0 } = options;

  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const requestHeaders = { ...headers };
    let downloadedSize = startBytes;

    if (resume && startBytes > 0) {
      requestHeaders['Range'] = `bytes=${startBytes}-`;
    }

    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: requestHeaders,
    };

    mkdirSync(dirname(outputPath), { recursive: true });

    let file = createWriteStream(outputPath, { flags: startBytes > 0 && resume ? 'a' : 'w' });
    let httpCode = 0;
    let finalSize = 0;
    let resumeUsed = false;
    const startTime = Date.now();

    const req = client.request(requestOptions, (res) => {
      httpCode = res.statusCode;

      // Handle redirect
      if (httpCode === 301 || httpCode === 302 || httpCode === 303 || httpCode === 307 || httpCode === 308) {
        const redirectUrl = res.headers.location;
        if (redirectUrl) {
          res.destroy();
          file.end();
          resolve(downloadFile(redirectUrl, outputPath, { ...options, resume: false, startBytes: 0 }));
          return;
        }
      }

      // Handle partial content (resume successful)
      if (httpCode === 206) {
        const contentRange = res.headers['content-range'];
        if (contentRange) {
          const totalSize = parseInt(contentRange.split('/')[1], 10);
          finalSize = totalSize;
          resumeUsed = true;
        }
      }

      // Handle full content when partial was expected (server doesn't support resume)
      if (httpCode === 200 && startBytes > 0 && resume) {
        if (existsSync(outputPath)) {
          unlinkSync(outputPath);
        }
        file.end();
        file = createWriteStream(outputPath);
        downloadedSize = 0;
        finalSize = 0;
        resumeUsed = false;
      }

      const contentLength = res.headers['content-length'] ? parseInt(res.headers['content-length'], 10) : 0;

      res.on('data', (chunk) => {
        downloadedSize += chunk.length;
        file.write(chunk);
        // Progress indicator
        if (finalSize > 0) {
          const percent = ((downloadedSize / finalSize) * 100).toFixed(1);
          process.stdout.write(`\rDownloading: ${percent}% (${downloadedSize}/${finalSize} bytes)`);
        } else if (contentLength > 0) {
          const percent = ((downloadedSize / (startBytes + contentLength)) * 100).toFixed(1);
          process.stdout.write(`\rDownloading: ${percent}% (${downloadedSize} bytes)`);
        }
      });

      res.on('end', () => {
        file.end();
        process.stdout.write('\n');
        const elapsedMs = Date.now() - startTime;
        resolve({
          httpCode,
          fileSize: statSync(outputPath).size,
          downloadedBytes: downloadedSize - startBytes,
          elapsedMs,
          resumeUsed,
        });
      });

      res.on('error', (err) => {
        file.end();
        reject(err);
      });
    });

    req.on('error', (err) => {
      file.end();
      reject(err);
    });

    req.setTimeout(timeout, () => {
      req.destroy();
      file.end();
      reject(new Error(`Download timeout after ${timeout}ms`));
    });

    req.end();
  });
}
