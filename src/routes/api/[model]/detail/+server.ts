import { buildWhereClause, omitIfEmptyObject, parseSearchParams, transformFieldsForeign } from '$lib/utils/common.js'
import prisma from '$lib/utils/prisma'
import { exception, success } from '$lib/utils/response'
import { configs } from '$lib/app/api/models/_index.js'
import { MESSAGE } from '$lib/app/api/constants'

function mergeDetailConfigs<T>(base: BaseOperationConfig<T>, operation?: BaseOperationConfig<T>): BaseOperationConfig<T> {
  return {
    allow: operation?.allow ?? base?.allow,
    fields: operation?.fields ?? base?.fields,
    where: operation?.where ?? base?.where,
    fieldsForeign: operation?.fieldsForeign ?? base?.fieldsForeign,
    by: operation?.by ?? base?.by
  }
}

export async function GET({params, url}) {
  try {
    if (!configs[`./${params.model}.ts`]) throw Error(MESSAGE.MODEL.CONFIG.NOT_FOUND)
    if (!prisma[params.model as keyof typeof prisma]) throw Error(MESSAGE.MODEL.NOT_FOUND)
    const config: ModelConfig<Record<string, any>> = (await configs[`./${params.model}.ts`]() as any).default
    
    // Merge base config with detail config
    const mergedConfig = mergeDetailConfigs(config, config.detail)
    
    if (!mergedConfig?.allow) throw Error(MESSAGE.MODEL.OPERATION_FORBIDDEN)
    let urlSearchParams = parseSearchParams(url.searchParams)

    const data = await (prisma as any)[params.model].findFirst({
      where: {
        ...Object.fromEntries((mergedConfig.by ?? []).map(field => {
          if (!urlSearchParams[field]) return
          return [field, urlSearchParams[field]]
        }).filter(item => !!item)),
        ...(mergedConfig.where ? buildWhereClause(mergedConfig.where) : {})
      },
      select: omitIfEmptyObject({
        ...(Object.fromEntries((mergedConfig.fields ?? Object.keys((prisma as any)[params.model].fields)).map(field => [field, true]))),
        ...(
          mergedConfig.fieldsForeign ?
          transformFieldsForeign(mergedConfig.fieldsForeign) : undefined
        ),
      })
    })
    
    return success({data})
  } catch (err) {
    return exception(err)
  }
}