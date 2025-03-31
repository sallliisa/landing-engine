import { parseSearchParams } from '$lib/utils/common';
import prisma from '$lib/utils/prisma.js';
import { exception, success } from '$lib/utils/response';

export async function GET({url}) {
  let urlSearchParams = parseSearchParams(url.searchParams);
  if (!urlSearchParams['form_type_id']) return exception('form_type_id is required');
  try {
    const data = await prisma.formField.findMany({
      where: {
        form_type_id: String(urlSearchParams['form_type_id'])
      },
      orderBy: {
        order: 'asc'
      },
    })
    return success({
      form_type_id: urlSearchParams['form_type_id'],
      data: data.map(item => (
        {
          ...item,
          form_type_id: undefined,
          value: null
        }
      ))
    })
  } catch (err) {
    return exception(err);
  }
}