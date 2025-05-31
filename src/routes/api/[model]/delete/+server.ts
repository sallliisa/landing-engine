import { MESSAGE } from '$lib/app/api/constants'
import { configs } from '$lib/app/api/models/_index'
import { buildWhereClause } from '$lib/utils/common'
import { deleteFile } from '$lib/utils/filestorage'
import prisma from '$lib/utils/prisma.js'
import { exception, success } from '$lib/utils/response.js'

function mergeDeleteConfigs<T>(base: BaseOperationConfig<T>, operation?: BaseOperationConfig<T>): BaseOperationConfig<T> {
  return {
    allow: operation?.allow ?? base?.allow,
    by: operation?.by ?? base?.by,
    where: operation?.where ?? base?.where
  }
}

export async function DELETE(event) {
  const {params, request} = event
  try {
    if (!configs[`./${params.model}.ts`]) throw Error(MESSAGE.MODEL.CONFIG.NOT_FOUND)
    if (!prisma[params.model as keyof typeof prisma]) throw Error(MESSAGE.MODEL.NOT_FOUND)
    const config: ModelConfig<Record<string, any>> = (await configs[`./${params.model}.ts`]() as any).default
    
    // Merge base config with delete config
    const mergedConfig = mergeDeleteConfigs(config, config.delete)
    
    if (!mergedConfig?.allow) throw Error(MESSAGE.MODEL.OPERATION_FORBIDDEN)
    const body = await request.json()

    const customWhereObject = mergedConfig.where ? mergedConfig.where(event) : undefined

    // Build where clause with both 'by' fields and additional where conditions
    const whereClause = {
      ...Object.fromEntries(
        (mergedConfig.by ?? []).map(key => [key, body[key] as string | number])
      ),
      ...(customWhereObject ? buildWhereClause(customWhereObject) : undefined)
    } as any

    const previousData = await (prisma as any)[params.model].findFirst({
      where: whereClause
    })

    if (!previousData) throw Error(MESSAGE.MODEL.RECORD.NOT_FOUND)

    // Handle file deletions using top-level types config
    if (config.types)
      for (const field of Object.keys(config.types))
        if (config.types[field]?.type === 'file' && previousData?.[field])
          await deleteFile(previousData[field])

    const data = await (prisma as any)[params.model].delete({
      where: whereClause
    })
    
    return success({data})
  } catch (err) {
    return exception(err)
  }
}