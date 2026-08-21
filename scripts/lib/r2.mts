/**
 * Shared Cloudflare R2 (S3-compatible) upload helpers for the event scripts.
 *
 * Credentials come from the environment (see .env.example); run scripts via
 * `op run --env-file=.env.op -- …` so 1Password injects them:
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL
 */
import { readFileSync } from 'node:fs'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

type R2Config = {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  publicBaseUrl: string
}

function requireEnv(keys: string[]): void {
  const missing = keys.filter((k) => !process.env[k])
  if (missing.length) {
    throw new Error(
      `Missing R2 env var(s): ${missing.join(', ')}. Run via an \`op run --env-file=.env.op\` npm script, or export them.`
    )
  }
}

/**
 * The bucket's PUBLIC base URL — the r2.dev subdomain or a custom domain.
 * NOT the S3 API endpoint (<account>.r2.cloudflarestorage.com), which needs
 * signed requests and can't be fetched by a browser (audio/img tags).
 */
function publicBaseUrl(): string {
  requireEnv(['R2_PUBLIC_BASE_URL'])
  const base = process.env.R2_PUBLIC_BASE_URL!.replace(/\/$/, '')
  if (base.includes('r2.cloudflarestorage.com')) {
    throw new Error(
      `R2_PUBLIC_BASE_URL is set to the private S3 API endpoint (${base}), which is not publicly readable. ` +
        `Use the bucket's public URL instead — enable the r2.dev subdomain (https://pub-xxxxx.r2.dev) or a custom domain.`
    )
  }
  return base
}

function config(): R2Config {
  requireEnv(['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET'])
  return {
    accountId: process.env.R2_ACCOUNT_ID!,
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    bucket: process.env.R2_BUCKET!,
    publicBaseUrl: publicBaseUrl(),
  }
}

/** Public URL for a key. Only needs R2_PUBLIC_BASE_URL (safe in dry runs). */
export function r2PublicUrl(key: string): string {
  return `${publicBaseUrl()}/${key}`
}

let client: S3Client | undefined
function getClient(cfg: R2Config): S3Client {
  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
    })
  }
  return client
}

/** Upload a buffer to R2 and return its public URL. */
export async function uploadBuffer(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  const cfg = config()
  await getClient(cfg).send(
    new PutObjectCommand({ Bucket: cfg.bucket, Key: key, Body: body, ContentType: contentType })
  )
  return `${cfg.publicBaseUrl}/${key}`
}

/** Upload a local file to R2 and return its public URL. */
export async function uploadFile(
  key: string,
  localPath: string,
  contentType: string
): Promise<string> {
  return uploadBuffer(key, readFileSync(localPath), contentType)
}
