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
	},
	toHaveCors(received) {
		const hasCors = received.headers['access-control-allow-origin'] === '*'
		return {
			pass: hasCors,
			message: () => `The request ${hasCors ? 'has': 'does not have'} CORS enabled`
		}
	},
	toStartWith(received: string, prefix: string) {
		return {
			pass: received.startsWith(prefix),
			message: () => `Expected to start with ${prefix}`
		}
	},
})

declare global {
	namespace Vi {
		interface JestAssertion {
			toMatchSchema(type: ZodType): void,
			toHaveCors(): void,
			toStartWith(prefix: string): void,
		}
	}
}
