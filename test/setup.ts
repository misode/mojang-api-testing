import { expect } from 'vitest'
import { ZodType } from 'zod'

expect.extend({
	toMatchSchema(received: unknown, schema: ZodType) {
		const { isNot } = this
		const result = schema.safeParse(received)
		const issue = result.success ? undefined : result.error.issues?.[0]

		return {
			pass: result.success,
			message: () => `${received} does${isNot ? ' not' : ''} match the schema${issue ? `: ${issue.message} (${issue.path})` : ''}`
		}
	}
})

declare global {
	namespace Vi {
		interface JestAssertion {
			toMatchSchema(type: ZodType): void,
		}
	}
}
