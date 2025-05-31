import { buildWhereClause, omitIfEmptyObject, parseSearchParams, resolveCustomField, transformFieldsForeign } from '$lib/utils/common.js'
import prisma from '$lib/utils/prisma'
import { exception, success } from '$lib/utils/response'
import { configs } from '$lib/app/api/models/_index.js'
import { MESSAGE } from '$lib/app/api/constants'

function mergeDetailConfigs<T>(base: ModelConfig<T>, operation?: DetailConfig<T>): DetailConfig<T> {
  return {
    allow: operation?.allow ?? base?.allow,
    fields: operation?.fields ?? base?.fields,
    where: operation?.where ?? base?.where,
    fieldsForeign: operation?.fieldsForeign ?? base?.view?.fieldsForeign,
    by: operation?.by ?? base?.by,
    customFields: operation?.customFields?? base?.view?.customFields,
  }
}

export async function GET(event) {
  const {params, url} = event
  try {
    if (!configs[`./${params.model}.ts`]) throw Error(MESSAGE.MODEL.CONFIG.NOT_FOUND)
    if (!prisma[params.model as keyof typeof prisma]) throw Error(MESSAGE.MODEL.NOT_FOUND)
    const config: ModelConfig<Record<string, any>> = (await configs[`./${params.model}.ts`]() as any).default
    
    const mergedConfig = mergeDetailConfigs(config, config.detail)
    
    if (!mergedConfig?.allow) throw Error(MESSAGE.MODEL.OPERATION_FORBIDDEN)
    let urlSearchParams = parseSearchParams(url.searchParams)

    // Lifecycle hook - pre
    if (config.detail?.lifecycle?.pre) {
      urlSearchParams = await config.detail?.lifecycle.pre(urlSearchParams);
    }

    const customWhereObject = mergedConfig.where ? mergedConfig.where(event) : undefined

    const whereClause = {
      ...Object.fromEntries((mergedConfig.by ?? []).map(field => {
        if (!urlSearchParams[field]) return
        return [field, urlSearchParams[field]]
      }).filter(item => !!item)),
      ...(customWhereObject ? buildWhereClause(customWhereObject) : undefined)
    };

    let data: Record<string, any>;
    
    // Lifecycle hook - main
    if (config.detail?.lifecycle?.main) {
      data = await config.detail?.lifecycle.main(whereClause, undefined, undefined);
    } else {
      data = await (prisma as any)[params.model].findFirst({
        where: whereClause,
        select: omitIfEmptyObject({
          ...(Object.fromEntries((mergedConfig.fields ?? Object.keys((prisma as any)[params.model].fields)).map(field => [field, true]))),
          ...(mergedConfig.fieldsForeign ? transformFieldsForeign(mergedConfig.fieldsForeign) : undefined),
        })
      });
    }

    // Lifecycle hook - post
    if (config.detail?.lifecycle?.post) {
      data = await config.detail?.lifecycle.post(data, undefined);
    }

    // Process custom fields if they exist
    if (data && mergedConfig.customFields) {
      mergedConfig.customFields.forEach(customField => {
        data[customField.name] = customField.generator(data);
      });
    }
    
    return success({data})
  } catch (err) {
    return exception(err)
  }
}