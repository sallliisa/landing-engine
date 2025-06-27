import { MESSAGE } from '$lib/app/api/constants.js'
import { configs } from '$lib/app/api/models/_index.js'
import { isValidFileURL, validateFields, processFileUrls } from '$lib/utils/common.js'
import { saveFileFromTemp } from '$lib/utils/filestorage.js'
import prisma from '$lib/utils/prisma.js'
import { exception, success } from '$lib/utils/response'

function mergeCreateConfigs<T>(base: ModelConfig<T>, operation?: CreateConfig<T>): CreateConfig<T> {
  return {
    allow: operation?.allow ?? base?.allow,
    fields: operation?.fields ?? base?.fields,
    validation: operation?.validation,
    by: operation?.by ?? base?.by,
    lifecycle: {
      pre: operation?.lifecycle?.pre ?? base?.transaction?.lifecycle?.pre,
      main: operation?.lifecycle?.main ?? base?.transaction?.lifecycle?.main,
      post: operation?.lifecycle?.post ?? base?.transaction?.lifecycle?.post,
    }
  }
}

export async function POST({params, request, locals}) {
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

    // Process file uploads in the request body
    body = await processFileUrls(body, {
      onTempFile: async (url) => {
        // If it's a temp file, move it to permanent storage
        return await saveFileFromTemp(url);
      }
      // No need for onClearFile or previousData in create operation
    });

    // Process config types (e.g., multi relationships)
    if (config.types) {
      for (const field of Object.keys(config.types)) {
        if (config.types[field]?.type === 'multi' && Array.isArray(body[field]) && body[field].length) {
          const by = config.types[field].params.by;
          body[field] = {
            connect: body[field].map((item: any) => ({
              [by]: item[by]
            }))
          }
        }
      }
    }
      

    // Lifecycle hooks
    if (config.create?.lifecycle?.pre)
      body = await config.create.lifecycle.pre(body, locals)

    let data = config.create?.lifecycle?.main ?
                await config.create.lifecycle.main(body, locals)
              :
                await (prisma as any)[params.model].create({
                  data: mergedConfig.fields ? 
                          Object.fromEntries(mergedConfig.fields.map(key => [key, body[key]]))
                        :
                          body
                })

    if (config.create?.lifecycle?.post)
      data = await config.create.lifecycle.post(body, data, locals) as any

    return success({data})
  } catch (err) {
    return exception(err)
  }
}