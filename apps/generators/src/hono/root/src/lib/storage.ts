const tmpl = () => {
	return `import {
	S3Client,
	PutObjectCommand,
	PutObjectRequest,
	GetObjectCommand,
	DeleteObjectCommand
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

type UploadCustomParams = Omit<
	PutObjectRequest,
	'Bucket' | 'Key' | 'Body' | 'ContentType' | 'ContentLength'
>

type UploadFileOptions = {
	fileName?: string
	bucket?: string
	params?: UploadCustomParams
}

export const storageExists = () => {
	if (!process.env.S3_BUCKET_NAME) return false
	if (!process.env.S3_BUCKET_ORIGIN) return false
	if (!process.env.S3_BUCKET_REGION) return false
	if (!process.env.S3_ACCESS_KEY_ID) return false
	if (!process.env.S3_SECRET_ACCESS_KEY) return false

	return true
}

export const client = new S3Client({
	region: process.env.S3_BUCKET_REGION!,
	endpoint: process.env.S3_BUCKET_ORIGIN!,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID!,
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
	},
})

export const getDatedName = (name: string) => {
	const splits = name.split('.')
	const originalName = splits.slice(0, -1).join('.')
	const extension = splits.slice(-1)[0]

	return \`\${originalName}-\${new Date().getTime()}.\${extension}\`
}

export const uploadFile = async (
	file: File,
	options: UploadFileOptions = {}
) => {
	const Key = options.fileName || getDatedName(file.name)

	const buffer = Buffer.from(await file.arrayBuffer())

	const Bucket = options.bucket || process.env.S3_BUCKET_NAME!

	if (!Bucket) {
		throw new Error('No bucket provided')
	}

	const putCommand = new PutObjectCommand({
		Bucket,
		Key,
		Body: buffer,
		ContentType: file.type,
		ContentLength: file.size,
		...options.params,
	})

	await client.send(putCommand)

	return Key
}

export const getFileUrl = (
	key: string,
	bucket?: string,
	expiresIn: number = 60
) => {
	const command = new GetObjectCommand({
		Bucket: bucket || process.env.S3_BUCKET_NAME,
		Key: key,
	})

	return getSignedUrl(client, command, { expiresIn })
}

export const getFileFromBucket = async (key: string, bucket?: string) => {
	const url = await getFileUrl(key, bucket)

	const res = await fetch(url)

	const blob = await res.blob()

	const content = Buffer.from(await blob.arrayBuffer())

	return content
}

export const deleteFile = async (key: string, bucket?: string) => {
	const command = new DeleteObjectCommand({
		Bucket: bucket || process.env.S3_BUCKET_NAME,
		Key: key,
	})

	await client.send(command)
}

`
}

export default tmpl
