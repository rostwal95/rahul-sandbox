export function s3Host(){ return process.env.NEXT_PUBLIC_S3_BUCKET_HOST || ''; }
export function s3Url(keyOrUrl: string){ return keyOrUrl.startsWith('http') ? keyOrUrl : `https://${s3Host()}/${keyOrUrl}`; }
