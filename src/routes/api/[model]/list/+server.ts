import { MESSAGE } from '$lib/app/api/constants.js';
import { configs } from '$lib/app/api/models/_index';
import { buildWhereClause, omitIfEmptyObject, parseSearchParams, transformFieldsForeign } from '$lib/utils/common.js';
import prisma from '$lib/utils/prisma.js';
import { exception, success } from '$lib/utils/response.js';

function mergeListConfigs<T>(base: BaseOperationConfig<T>, operation?: BaseOperationConfig<T>): BaseOperationConfig<T> {
  return {
    allow: operation?.allow ?? base?.allow,
    fields: operation?.fields ?? base?.fields,
    where: operation?.where ?? base?.where,
    fieldsForeign: operation?.fieldsForeign ?? base?.fieldsForeign,
    by: operation?.by ?? base?.by
  }
}

export async function GET({ params, url }) {
  try {
    if (!configs[`./${params.model}.ts`]) throw Error(MESSAGE.MODEL.CONFIG.NOT_FOUND);
    if (!prisma[params.model as keyof typeof prisma]) throw Error(MESSAGE.MODEL.NOT_FOUND);

    const config: ModelConfig<Record<string, any>> = (await (configs[`./${params.model}.ts`] as any)()).default;
    
    // Merge base config with list config
    const mergedConfig = mergeListConfigs(config, config.list);
    
    if (!mergedConfig?.allow) throw Error(MESSAGE.MODEL.OPERATION_FORBIDDEN);

    let urlSearchParams = parseSearchParams(url.searchParams);

    // Extract pagination parameters
    const limit = parseInt(urlSearchParams.limit as any) || 10;
    const page = parseInt(urlSearchParams.page as any) || 1;
    const skip = (page - 1) * limit;

    // Build where clause once for reuse
    const whereClause = {
      ...(
        config.list?.filterableBy
          ? Object.fromEntries(
              config.list.filterableBy.map(field => {
                if (!urlSearchParams[field]) return;
                return [field, urlSearchParams[field]];
              }).filter(item => !!item)
            )
          : undefined
      ),
      ...(
        config.list?.searchableBy
          ? Object.fromEntries(
              config.list.searchableBy.map(field => {
                if (!urlSearchParams['search']) return;
                return [field, { contains: urlSearchParams['search'], mode: 'insensitive' }];
              }).filter(item => !!item)
            )
          : undefined
      ),
      ...(mergedConfig.where ? buildWhereClause(mergedConfig.where) : undefined)
    };

    const data = await (prisma as any)[params.model].findMany({
      orderBy: config.list?.orderBy,
      where: whereClause,
      select: omitIfEmptyObject({
        ...(Object.fromEntries((mergedConfig.fields ?? Object.keys((prisma as any)[params.model].fields)).map(field => [field, true]))),
        ...(mergedConfig.fieldsForeign ? transformFieldsForeign(mergedConfig.fieldsForeign) : undefined),
      }),
      skip,
      take: limit
    });

    // Count total records for pagination metadata
    const totalRecords = await (prisma as any)[params.model].count({
      where: whereClause
    });

    const totalPages = Math.ceil(totalRecords / limit);

    return success({
      data,
      meta: {
        totalRecords,
        totalPages,
        currentPage: page,
        limit
      }
    });
  } catch (err) {
    return exception(err);
  }
}
