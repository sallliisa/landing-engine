import { MESSAGE } from '$lib/app/api/constants.js'
import { configs } from '$lib/app/api/models/_index.js'
import { validateFields } from '$lib/utils/common'
import { saveFileFromTemp } from '$lib/utils/filestorage.js'
import prisma from '$lib/utils/prisma.js'
import { exception, success } from '$lib/utils/response'

function mergeCreateConfigs<T>(
  base: ModelConfig<T>,
  operation?: BaseOperationConfig<T> & TransactionOperationConfig<T>
): BaseOperationConfig<T> & TransactionOperationConfig<T> {
  return {
    allow: operation?.allow ?? base?.allow,
    fields: operation?.fields ?? base?.fields,
    validation: operation?.validation,
    where: operation?.where ?? base?.where,
    fieldsForeign: operation?.fieldsForeign ?? base?.fieldsForeign,
    by: operation?.by ?? base?.by
  }
}

export async function POST({params, request}) {
  try {
    if (!configs[`./${params.model}.ts`]) throw Error(MESSAGE.MODEL.CONFIG.NOT_FOUND)
    if (!prisma[params.model as keyof typeof prisma]) throw Error(MESSAGE.MODEL.NOT_FOUND)
    const config: ModelConfig<Record<string, any>> = (await configs[`./${params.model}.ts`]() as any).default
    
    // Merge base config with create config
    const mergedConfig = mergeCreateConfigs(config, config.create)
    
    if (!mergedConfig?.allow) throw Error(MESSAGE.MODEL.OPERATION_FORBIDDEN)
    let body = await request.json()

    // Validation check using merged config
    if (mergedConfig.validation) {
      await validateFields(body, mergedConfig.validation)
    }

    // Handle file uploads
    if (config.types)
      for (const field of Object.keys(config.types))
        if (config.types[field] === 'file' && body[field])
          body[field] = await saveFileFromTemp(body[field])

    // Lifecycle hooks
    if (config.create?.lifecycle?.pre)
      body = await config.create.lifecycle.pre(body)

    let data = config.create?.lifecycle?.main ?
                await config.create.lifecycle.main(body)
              :
                await (prisma as any)[params.model].create({
                  data: mergedConfig.fields ? 
                          Object.fromEntries(mergedConfig.fields.map(key => [key, body[key]]))
                        :
                          body
                })

    if (config.create?.lifecycle?.post)
      data = await config.create.lifecycle.post(body, data) as any

    return success({data})
  } catch (err) {
    return exception(err)
  }
}