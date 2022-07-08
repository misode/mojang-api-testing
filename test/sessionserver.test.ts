import axios from 'axios'
import { expect, test } from 'vitest'
import { array, boolean, number, object, optional, string, z } from 'zod'

test('blocked servers', async () => {
	const res = await axios.get('https://sessionserver.mojang.com/blockedservers')
	expect(res.status).toBe(200)
	expect(res).not.toHaveCors()
	expect(typeof res.data).toBe('string')
})

const UserProfile = object({
	id: string(),
	name: string(),
	properties: array(object({
		name: string(),
		value: string(),
		signature: optional(string()),
	})),
	legacy: optional(boolean()),
})
const SkinTexture = object({
	timestamp: number(),
	profileId: string(),
	profileName: string(),
	textures: object({
		SKIN: object({
			url: string(),
			metadata: optional(object({
				model: z.enum(['slim', 'classic']),
			})),
		}),
		CAPE: optional(object({
			url: string(),
		})),
	}),
})
test('user profile and skin', async () => {
	const res = await axios.get('https://sessionserver.mojang.com/session/minecraft/profile/751b032b7fda41dca04a747784f7fed6')
	expect(res.status).toBe(200)
	expect(res).not.toHaveCors()
	expect(res.data).toMatchSchema(UserProfile)
	const encodedSkin = res.data.properties[0]?.value
	expect(encodedSkin).not.toBe(undefined)
	const decodedSkin = Buffer.from(encodedSkin, 'base64').toString('ascii')
	const skin = JSON.parse(decodedSkin)
	expect(skin).toMatchSchema(SkinTexture)
})
