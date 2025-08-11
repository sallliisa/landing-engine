import { MESSAGE } from '$lib/app/api/constants'
import { configs } from '$lib/app/api/models/_index'
import { buildWhereClause, processFileUrls } from '$lib/utils/common'
import { deleteFile } from '$lib/utils/filestorage'
import prisma from '$lib/utils/prisma.js'
import { exception, success } from '$lib/utils/response.js'
import { validateFields } from '$lib/utils/common'

function mergeDeleteConfigs<T>(
	base: BaseOperationConfig<T>,
	operation?: DeleteConfig<T>
): DeleteConfig<T> {
	return {
		allow: operation?.allow ?? base?.allow,
		by: operation?.by ?? base?.by,
		where: operation?.where ?? base?.where,
		lifecycle: operation?.lifecycle,
		validation: operation?.validation
	};
}

export async function DELETE(event) {
	const { params, request, locals } = event;
	try {
		if (!configs[`./${params.model}.ts`]) throw Error(MESSAGE.MODEL.CONFIG.NOT_FOUND);
		if (!prisma[params.model as keyof typeof prisma]) throw Error(MESSAGE.MODEL.NOT_FOUND);
		const config: ModelConfig<Record<string, any>> = (await configs[`./${params.model}.ts`]() as any).default

		// Merge base config with delete config
		const mergedConfig = mergeDeleteConfigs(config, config.delete);

		if (!mergedConfig?.allow) throw Error(MESSAGE.MODEL.OPERATION_FORBIDDEN);
		let body = await request.json();

		// Validation check using merged config
		if (mergedConfig.validation) {
			await validateFields(body, mergedConfig.validation);
		}

		const customWhereObject = mergedConfig.where ? await mergedConfig.where(event) : undefined;

		// Build where clause with both 'by' fields and additional where conditions
		const whereClause = {
			...Object.fromEntries((mergedConfig.by ?? []).map((key) => [key, body[key]])),
			...(customWhereObject ? buildWhereClause(customWhereObject) : undefined)
		} as any;

		// PRE
		if (mergedConfig.lifecycle?.pre) {
			body = await mergedConfig.lifecycle.pre(body, locals);
		}

		const previousData = await (prisma as any)[params.model].findFirst({
			where: whereClause
		});

		if (!previousData) throw Error(MESSAGE.MODEL.RECORD.NOT_FOUND);

		// Handle file deletions using processFileUrls
		await processFileUrls(previousData, {
			onFile: async (url: string) => {
				if (url) {
					await deleteFile(url)
        }
      }
    });

		// MAIN
		let data;
		if (mergedConfig.lifecycle?.main) {
			data = await mergedConfig.lifecycle.main(body, locals);
		} else {
			data = await (prisma as any)[params.model].delete({
				where: whereClause
			});
		}

		// POST
		if (mergedConfig.lifecycle?.post) {
			data = await mergedConfig.lifecycle.post(body, data, locals);
		}

		return success({ data });
	} catch (err) {
		return exception(err);
	}
}