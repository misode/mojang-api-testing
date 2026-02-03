import axios from 'axios'
import { expect, test } from 'vitest'
import { any, array, number, object, optional, record, string, z } from 'zod'

const VersionManifest = object({
	latest: object({
		release: string(),
		snapshot: string(),
	}),
	versions: array(object({
		id: string(),
		type: z.enum(['snapshot', 'release', 'old_alpha', 'old_beta']),
		url: string(),
		time: string(),
		releaseTime: string(),
	})),
})
test('version manifest', async () => {
	const res = await axios.get('https://launchermeta.mojang.com/mc/game/version_manifest.json')
	expect(res.status).toBe(200)
	expect(res).toHaveCors()
	expect(res.data).toMatchSchema(VersionManifest)
})

const DownloadMetadata = object({
	sha1: string(),
	size: number(),
	url: string(),
})
const VersionMetadata = object({
	arguments: object({
		game: array(any()),
		jvm: array(any()),
	}),
	assetIndex: DownloadMetadata.extend({
		id: string(),
		totalSize: number(),
	}),
	assets: string(),
	complianceLevel: number(),
	downloads: z.object({
		client: DownloadMetadata,
		client_mappings: DownloadMetadata.optional(),
		server: DownloadMetadata,
		server_mappings: DownloadMetadata.optional(),
	}),
	id: string(),
	javaVersion: object({
		component: string(),
		majorVersion: number(),
	}),
	libraries: array(object({
		downloads: object({
			artifact: DownloadMetadata.extend({
				path: string(),
			}),
		}),
		name: string(),
		natives: optional(object({})),
		rules: optional(array(object({
			action: z.enum(['allow', 'disallow']),
			os: optional(object({
				name: string(),
			})),
		}))),
	})),
	logging: object({
		client: object({
			argument: string(),
			file: DownloadMetadata.extend({
				id: string(),
			}),
			type: string(),
		}),
	}),
	mainClass: string(),
	minimumLauncherVersion: number(),
	releaseTime: string(),
	time: string(),
	type: string(),
})
test('version metadata', async () => {
	const res = await axios.get('https://launchermeta.mojang.com/v1/packages/f1cf44b0fb6fe11910bac139617b72bf3ef330b9/1.18.2.json')
	expect(res.status).toBe(200)
	expect(res).toHaveCors()
	expect(res.data).toMatchSchema(VersionMetadata)
})

const VersionAssets = object({
	objects: record(object({
		hash: string(),
		size: number(),
	})),
})
test('version assets', async () => {
	const res = await axios.get('https://launchermeta.mojang.com/v1/packages/de57d9f6d65a980f86df431603287248d4f148b5/1.18.json')
	expect(res.status).toBe(200)
	expect(res).toHaveCors()
	expect(res.data).toMatchSchema(VersionAssets)
})

test('navigate', async () => {
	const manifestRes = await axios.get('https://launchermeta.mojang.com/mc/game/version_manifest.json')
	expect(manifestRes.status).toBe(200)
	expect(manifestRes.data).toMatchSchema(VersionManifest)

	const snapshot = manifestRes.data.versions.find(v => v.id === manifestRes.data.latest.snapshot)
	expect(snapshot).not.toBe(undefined)
	const versionRes = await axios.get(snapshot.url)
	expect(versionRes.status).toBe(200)
	expect(versionRes.data).toMatchSchema(VersionMetadata)

	const assetsRes = await axios.get(versionRes.data.assetIndex.url)
	expect(assetsRes.status).toBe(200)
	expect(assetsRes.data).toMatchSchema(VersionAssets)
})
