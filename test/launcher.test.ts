import axios from 'axios'
import { expect, test } from 'vitest'

const MappingsPrefix = '# (c) 2020 Microsoft Corporation. These mappings are provided "as-is" and you bear the risk of using them. You may copy and use the mappings for development purposes, but you may not redistribute the mappings complete and unmodified. Microsoft makes no warranties, express or implied, with respect to the mappings provided here.  Use and modification of this document or the source code (in any form) of Minecraft: Java Edition is governed by the Minecraft End User License Agreement available at https://account.mojang.com/documents/minecraft_eula.'
test('mappings', async () => {
	const res = await axios.get('https://launcher.mojang.com/v1/objects/a661c6a55a0600bd391bdbbd6827654c05b2109c/client.txt')
	expect(res.status).toBe(200)
	expect(res).not.toHaveCors()
	expect(typeof res.data).toBe('string')
	expect(res.data).toStartWith(MappingsPrefix)
})
