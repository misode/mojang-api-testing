import axios from 'axios'
import { expect, test } from 'vitest'
import { array, object, string } from 'zod'

const UserUUID = object({
	name: string(),
	id: string(),
})
test('username to UUID', async () => {
	const res = await axios.get('https://api.mojang.com/users/profiles/minecraft/misode')
	expect(res.status).toBe(200)
	expect(res).not.toHaveCors()
	expect(res.data).toMatchSchema(UserUUID)
	expect(res.data.id).toBe('751b032b7fda41dca04a747784f7fed6')
})

test('username to UUID (too long name)', async () => {
	const res = await axios.get('https://api.mojang.com/users/profiles/minecraft/thisnamedoesnotexistandiswaytoolong', { validateStatus: () => true })
	expect(res.status).toBe(400)
})

test('username to UUID (does not exist)', async () => {
	const res = await axios.get('https://api.mojang.com/users/profiles/minecraft/thisnamedoesnotexist', { validateStatus: null })
	expect(res.status).toBe(404)
})

const MultipleUserUUID = array(UserUUID)
test('multiple usernames to UUIDs', async () => {
	const res = await axios.post('https://api.mojang.com/profiles/minecraft', [
		'thx',
		'Dusks',
		'tanpug',
	], { validateStatus: null })
	expect(res.status).toBe(200)
	expect(res.data.length === 3)
	expect(res.data.some(r => r.name === 'Dusks' && r.id === '8af296533b6844d085932742dca689c9'))
})

test('UUID to username', async () => {
	const res = await axios.get('https://api.mojang.com/user/profile/751b032b7fda41dca04a747784f7fed6')
	expect(res.status).toBe(200)
	expect(res).not.toHaveCors()
	expect(res.data).toMatchSchema(UserUUID)
	expect(res.data.name).toBe('misode')
})

test('UUID to username (invalid UUID)', async () => {
	const res = await axios.get('https://api.mojang.com/user/profile/thisisnotauuid', { validateStatus: () => true })
	expect(res.status).toBe(400)
})

test('UUID to username (unknown UUID)', async () => {
	const res = await axios.get('https://api.mojang.com/user/profile/cdb5aee90f904fdda63b316d38cd6b3b', { validateStatus: null })
	expect(res.status).toBe(404)
})
