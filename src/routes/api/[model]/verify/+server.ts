import { MESSAGE } from '$lib/app/api/constants';
import { configs } from '$lib/app/api/models/_index';
import prisma from '$lib/utils/prisma';
import { exception, success } from '$lib/utils/response';
import type { RequestHandler } from './$types';
import type { Prisma, PrismaClient } from '@prisma/client';

type ModelName = keyof Omit<
	typeof prisma,
	'$transaction' | '$queryRaw' | '$executeRaw' | '$queryRawUnsafe' | '$executeRawUnsafe' | '$on'
>;

function mergeVerifyConfigs<T>(
	base: ModelConfig<T>,
	operation?: VerifyConfig<T>
): VerifyConfig<T> {
	return {
		allow: operation?.allow ?? base?.allow,
		by: operation?.by!,
		stateField: operation?.stateField!,
		initialState: operation?.initialState!,
		states: operation?.states!,
		transitions: operation?.transitions!,
		lifecycle: operation?.lifecycle
	};
}

export const POST: RequestHandler = async ({ params, request, locals }) => {
	try {
		const { model } = params;
		if (!configs[`./${model}.ts`]) throw Error(MESSAGE.MODEL.CONFIG.NOT_FOUND);
		if (!prisma[model as ModelName]) throw Error(MESSAGE.MODEL.NOT_FOUND);
		const config: ModelConfig<Record<string, any>> = (
			(await configs[`./${model}.ts`]()) as any
		).default;

		const mergedConfig = mergeVerifyConfigs(config, config.verify);

		if (!mergedConfig?.allow) throw Error(MESSAGE.MODEL.OPERATION_FORBIDDEN);

		let body = await request.json();
		const { action, description } = body;

		if (!mergedConfig.by) throw new Error(`"by" is not configured for model "${model}"`);
		const whereClause = {
			[mergedConfig.by]: body[mergedConfig.by]
		};

		const transition = mergedConfig.transitions[action];
		if (!transition) {
			throw new Error(
				`Action "${action}" is not allowed. Available actions are: ${Object.keys(
					mergedConfig.transitions
				).join(', ')}`
			);
		}

		// PRE
		if (mergedConfig.lifecycle?.pre) {
			body = await mergedConfig.lifecycle.pre(body, locals);
		}

		// MAIN
		let data;
		if (mergedConfig.lifecycle?.main) {
			data = await mergedConfig.lifecycle.main(body, locals, whereClause);
		} else {
			const record = await (prisma[model as ModelName] as any).findUnique({ where: whereClause });
			if (!record) throw new Error('Record not found.');

			const currentState = record[mergedConfig.stateField];
			const allowedFromStates = Array.isArray(transition.from)
				? transition.from
				: [transition.from];

			if (!allowedFromStates.includes(currentState)) {
				throw new Error(
					`Action "${action}" cannot be performed from state "${currentState}". Allowed from states: ${allowedFromStates.join(', ')}`
				);
			}

			data = await (prisma[model as ModelName] as any).update({
				where: whereClause,
				data: {
					[mergedConfig.stateField]: transition.to
				}
			});
		}

		// POST
		if (mergedConfig.lifecycle?.post) {
			data = await mergedConfig.lifecycle.post(body, data, locals);
		} else {
			// Default post-verification: Log the action
			await prisma.verificationLog.create({
				data: {
					model,
					data_id: body[mergedConfig.by],
					action,
					description,
					verifier_id: (locals as any).user.id
				}
			});
		}

		return success({
			message: `Successfully ${action.toLowerCase()}d the changes.`,
			data
		});
	} catch (err) {
		return exception(err);
	}
}; 