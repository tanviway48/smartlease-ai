import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

function getR2Config() {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    throw new Error(
      "Missing Cloudflare R2 environment variables. Please set CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, CLOUDFLARE_R2_BUCKET_NAME, and CLOUDFLARE_R2_PUBLIC_URL."
    );
  }

  return { accountId, accessKeyId, secretAccessKey, bucketName, publicUrl };
}

function createR2Client(): S3Client {
  const { accountId, accessKeyId, secretAccessKey } = getR2Config();
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export function generateR2Key(userId: string, fileName: string): string {
  const sanitized = fileName
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9.\-_]/g, "");
  return `leases/${userId}/${Date.now()}-${sanitized}`;
}

export async function uploadToR2(params: {
  key: string;
  buffer: Buffer;
  contentType: string;
}): Promise<string> {
  const client = createR2Client();
  const { bucketName, publicUrl } = getR2Config();

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: params.key,
      Body: params.buffer,
      ContentType: params.contentType,
    })
  );

  return `${publicUrl}/${params.key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = createR2Client();
  const { bucketName } = getR2Config();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );
}
