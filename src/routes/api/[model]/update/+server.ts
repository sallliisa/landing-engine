import { MESSAGE } from '$lib/app/api/constants'
import { configs } from '$lib/app/api/models/_index'
import { buildWhereClause, isValidUrl, validateFields } from '$lib/utils/common.js'
import { deleteFile, saveFileFromTemp } from '$lib/utils/filestorage.js'
import prisma from '$lib/utils/prisma.js'
import { exception, success } from '$lib/utils/response.js'

function mergeUpdateConfigs<T>(
  base: ModelConfig<T>,
  create?: BaseOperationConfig<T> & TransactionOperationConfig<T>,
  update?: BaseOperationConfig<T> & TransactionOperationConfig<T>
): BaseOperationConfig<T> & TransactionOperationConfig<T> {
  return {
    allow: update?.allow ?? base?.allow,
    fields: update?.fields ?? create?.fields ?? base?.fields,
    validation: update?.validation ?? create?.validation,
    where: update?.where ?? create?.where ?? base?.where,
    fieldsForeign: update?.fieldsForeign ?? create?.fieldsForeign ?? base?.fieldsForeign,
    by: update?.by ?? create?.by ?? base?.by
  }
}

export async function PUT({params, request}) {
  try {
    if (!configs[`./${params.model}.ts`]) throw Error(MESSAGE.MODEL.CONFIG.NOT_FOUND)
    if (!prisma[params.model as keyof typeof prisma]) throw Error(MESSAGE.MODEL.NOT_FOUND)
    const config: ModelConfig<Record<string, any>> = (await configs[`./${params.model}.ts`]() as any).default
    
    // Merge configs: base -> create -> update
    const mergedConfig = mergeUpdateConfigs(config, config.create, config.update)
    
    if (!mergedConfig?.allow) throw Error(MESSAGE.MODEL.OPERATION_FORBIDDEN)
    let body = await request.json()
    
    if (mergedConfig.validation) {
      await validateFields(body, mergedConfig.validation)
    }

    const whereClause = {
      ...Object.fromEntries((mergedConfig.by ?? []).map(key => [key, body[key] as string | number])) as any,
      ...(mergedConfig.where ? buildWhereClause(mergedConfig.where) : undefined)
    }

    const previousData = await (prisma as any)[params.model].findFirst({
      where: whereClause
    })

    if (!previousData) throw Error(MESSAGE.MODEL.RECORD.NOT_FOUND)

    if (config.types)
      for (const field of Object.keys(config.types))
        if (config.types[field] === 'file') {
          if (isValidUrl(body[field])) {
            if (body[field]) body[field] = await saveFileFromTemp(body[field])
            else if (previousData[field]) await deleteFile(previousData[field])
          }
        }

    if (config.update?.lifecycle?.pre)
      body = await config.update.lifecycle.pre(body)

    let data = config.update?.lifecycle?.main ?
                await config.update.lifecycle.main(body)
              :
                await (prisma as any)[params.model].update({
                  where: whereClause,
                  data: mergedConfig.fields ? 
                          Object.fromEntries(mergedConfig.fields.map(key => [key, body[key]]))
                        :
                          body
                })

    if (config.update?.lifecycle?.post)
      data = await config.update.lifecycle.post(body, data) as any

    return success({data})
  } catch (err) {
    return exception(err)
  }
}