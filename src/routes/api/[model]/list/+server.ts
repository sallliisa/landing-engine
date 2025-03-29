import { MESSAGE } from '$lib/app/api/constants.js';
import { configs } from '$lib/app/api/models/_index';
import { buildWhereClause, omitIfEmptyObject, parseSearchParams, resolveCustomField, transformFieldsForeign } from '$lib/utils/common.js';
import prisma from '$lib/utils/prisma.js';
import { exception, success } from '$lib/utils/response.js';
import { withPagination } from '$lib/utils/pagination';

function mergeListConfigs<T>(base: ModelConfig<T>, operation?: ListConfig<T>): ListConfig<T> {
  return {
    allow: operation?.allow ?? base?.allow,
    fields: operation?.fields ?? base?.fields,
    where: operation?.where ?? base?.where,
    fieldsForeign: operation?.fieldsForeign ?? base?.view?.fieldsForeign,
    by: operation?.by ?? base?.by,
    customFields: operation?.customFields ?? base?.view?.customFields,
  }
}

export async function GET({ params, url }) {
  try {
    if (!configs[`./${params.model}.ts`]) throw Error(MESSAGE.MODEL.CONFIG.NOT_FOUND);
    if (!prisma[params.model as keyof typeof prisma]) throw Error(MESSAGE.MODEL.NOT_FOUND);

    const config: ModelConfig<Record<string, any>> = (await (configs[`./${params.model}.ts`] as any)()).default;
    const mergedConfig = mergeListConfigs(config, config.list);
    
    if (!mergedConfig?.allow) throw Error(MESSAGE.MODEL.OPERATION_FORBIDDEN);

    let urlSearchParams = parseSearchParams(url.searchParams);

    // Lifecycle hook - pre
    if (config.list?.lifecycle?.pre) {
      urlSearchParams = await config.list.lifecycle.pre(urlSearchParams);
    }

    // Build where clause
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

    const paginatedData = await withPagination(async (skip, take) => {
      let data;
      
      // Lifecycle hook - main
      if (config.list?.lifecycle?.main) {
        data = await config.list?.lifecycle.main(whereClause, skip, take);
      } else {
        data = await (prisma as any)[params.model].findMany({
          orderBy: config.list?.orderBy,
          where: whereClause,
          select: omitIfEmptyObject({
            ...(Object.fromEntries((mergedConfig.fields ?? Object.keys((prisma as any)[params.model].fields)).map(field => [field, true]))),
            ...(mergedConfig.fieldsForeign ? transformFieldsForeign(mergedConfig.fieldsForeign) : undefined),
          }),
          skip,
          take
        });
      }

      const total = await (prisma as any)[params.model].count({
        where: whereClause
      });

      // Lifecycle hook - post
      if (config.list?.lifecycle?.post) {
        data = await config.list?.lifecycle.post(data, total);
      }

      // Process custom fields
      if (mergedConfig?.customFields) {
        data.forEach((item: any) => {
          mergedConfig.customFields!.forEach(customField => {
            item[customField.name] = customField.generator(item);
          });
        });
      }

      return { data, total };
    }, urlSearchParams);

    return success(paginatedData);
  } catch (err) {
    return exception(err);
  }
}
