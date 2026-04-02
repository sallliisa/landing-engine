import { MESSAGE } from "$lib/app/api/constants.js";
import { configs } from "$lib/app/api/models/_index";
import prisma from "$lib/utils/prisma.js";
import { reorderEntries } from "$lib/utils/reorder";
import { exception, success } from "$lib/utils/response";
import { authorizeOperation } from '$lib/app/api/authorization';

function mergeReorderConfigs<T>(
	base: ModelConfig<T>,
	operation?: ReorderConfig<T>
): ReorderConfig<T> {
	return {
		allow: operation?.allow ?? base?.allow,
		permission: operation?.permission ?? base?.permission,
		by: operation?.by ?? base?.by,
		axis: operation?.axis ?? [],
		lifecycle: operation?.lifecycle
	};
}

// --- MAIN HANDLER ---
export async function PUT(event) {
	const { params, request, locals } = event;
	try {
		if (!configs[`./${params.model}.ts`]) throw Error(MESSAGE.MODEL.CONFIG.NOT_FOUND);
		if (!prisma[params.model as keyof typeof prisma]) throw Error(MESSAGE.MODEL.NOT_FOUND);
		const config: ModelConfig<Record<string, any>> = (
			(await configs[`./${params.model}.ts`]()) as any
		).default;

		const mergedConfig = mergeReorderConfigs(config, config.reorder);

		if (!mergedConfig?.allow) throw Error(MESSAGE.MODEL.OPERATION_FORBIDDEN);

		let body = await request.json();
		await authorizeOperation(event, params.model, 'reorder', mergedConfig, body);

		// PRE
		if (mergedConfig.lifecycle?.pre) {
			body = await mergedConfig.lifecycle.pre(body, locals);
		}

		// MAIN
		let data;
		if (mergedConfig.lifecycle?.main) {
			data = await mergedConfig.lifecycle.main(body, locals);
		} else {
			const { id, old_order, new_order } = body;
			data = await reorderEntries({
				oldOrder: old_order,
				newOrder: new_order,
				model: params.model,
				id
			});
		}

		// POST
		if (mergedConfig.lifecycle?.post) {
			data = await mergedConfig.lifecycle.post(body, data, locals);
		}

		return success(data);
	} catch (err) {
		return exception(err);
	}
}
