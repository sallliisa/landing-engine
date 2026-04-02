import { MESSAGE } from '$lib/app/api/constants'
import { configs } from '$lib/app/api/models/_index'
import { buildWhereClause, isValidFileURL, isValidTempFileURL, isValidUrl, validateFields, processFileUrls } from '$lib/utils/common.js'
import { deleteFile, saveFileFromTemp } from '$lib/utils/filestorage.js'
import prisma from '$lib/utils/prisma.js'
import { exception, success } from '$lib/utils/response.js'
import { authorizeOperation } from '$lib/app/api/authorization'

function mergeUpdateConfigs<T>(base: ModelConfig<T>, create?: CreateConfig<T>, update?: UpdateConfig<T>): UpdateConfig<T> {
  return {
    allow: update?.allow ?? base?.allow,
    permission: update?.permission ?? create?.permission ?? base?.permission,
    fields: update?.fields ?? create?.fields ?? base?.fields,
    validation: update?.validation ?? create?.validation,
    where: update?.where ?? base?.where,
    by: update?.by ?? create?.by ?? base?.by,
    lifecycle: {
      pre: update?.lifecycle?.pre ?? create?.lifecycle?.pre ?? base?.transaction?.lifecycle?.pre,
      main: update?.lifecycle?.main ?? create?.lifecycle?.main ?? base?.transaction?.lifecycle?.main,
      post: update?.lifecycle?.post ?? create?.lifecycle?.post ?? base?.transaction?.lifecycle?.post,
    }
  }
}

export async function PUT(event) {
  const {params, request, locals} = event
  try {
    if (!configs[`./${params.model}.ts`]) throw Error(MESSAGE.MODEL.CONFIG.NOT_FOUND)
    if (!prisma[params.model as keyof typeof prisma]) throw Error(MESSAGE.MODEL.NOT_FOUND)
    const config: ModelConfig<Record<string, any>> = (await configs[`./${params.model}.ts`]() as any).default
    
    // Merge configs: base -> create -> update
    const mergedConfig = mergeUpdateConfigs(config, config.create, config.update)
    
    if (!mergedConfig?.allow) throw Error(MESSAGE.MODEL.OPERATION_FORBIDDEN)
    let body = await request.json()
    await authorizeOperation(event, params.model, 'update', mergedConfig, body)
    
    if (mergedConfig.validation) {
      await validateFields(body, mergedConfig.validation)
    }

    const customWhereObject = mergedConfig.where ? await mergedConfig.where(event) : undefined

    const whereClause = {
      ...Object.fromEntries((mergedConfig.by ?? []).map(key => [key, body[key] as string | number])) as any,
      ...(customWhereObject ? buildWhereClause(customWhereObject) : undefined)
    }

    const previousData = await (prisma as any)[params.model].findFirst({
      where: whereClause
    })

    if (!previousData) throw Error(MESSAGE.MODEL.RECORD.NOT_FOUND)

    // Process file uploads in the request body
    body = await processFileUrls(body, {
      onTempFile: async (url) => {
        // If it's a temp file, move it to permanent storage
        return await saveFileFromTemp(url);
      },
      onClearFile: async (url) => {
        // If file field is being cleared and there was a previous file, delete it
        if (url) {
          await deleteFile(url);
        }
      },
      previousData
    });

    // Process config types (e.g., multi relationships)
    if (config.types) {
      for (const field of Object.keys(config.types)) {
        if (config.types[field]?.type === 'multi' && Array.isArray(body[field]) && body[field].length) {
          const by = config.types[field].params.by;
          body[field] = {
            set: body[field].map((item: any) => ({
              [by]: item[by]
            }))
          };
        }
      }
    }
      

    if (config.update?.lifecycle?.pre)
      body = await config.update.lifecycle.pre(body, locals)

    let data = config.update?.lifecycle?.main ?
                await config.update.lifecycle.main(body, locals, whereClause)
              :
                await (prisma as any)[params.model].update({
                  where: whereClause,
                  data: mergedConfig.fields ? 
                          Object.fromEntries(mergedConfig.fields.map(key => [key, body[key]]))
                        :
                          body
                })

    if (config.update?.lifecycle?.post)
      data = await config.update.lifecycle.post(body, data, locals) as any

    return success({data})
  } catch (err) {
    return exception(err)
  }
}
