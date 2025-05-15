import { MESSAGE } from "$lib/app/api/constants.js";
import { configs } from "$lib/app/api/models/_index";
import prisma from "$lib/utils/prisma.js";
import { exception, success } from "$lib/utils/response";

function mergeUpdateConfigs<T>(
  base: ModelConfig<T>,
  reorder?: ReorderConfig<T>
): ReorderConfig<T> {
  return {
    allow: reorder?.allow ?? false,
    axis: reorder?.axis!,
  };
}

export async function PUT({ params, request }) {
  try {
    if (!configs[`./${params.model}.ts`]) throw Error(MESSAGE.MODEL.CONFIG.NOT_FOUND);
    if (!prisma[params.model as keyof typeof prisma]) throw Error(MESSAGE.MODEL.NOT_FOUND);
    const config: ModelConfig<Record<string, any>> = ((await configs[`./${params.model}.ts`]()) as any).default;

    const mergedConfig = mergeUpdateConfigs(config, config.reorder);

    if (!mergedConfig?.allow) throw Error(MESSAGE.MODEL.OPERATION_FORBIDDEN);

    const body = await request.json();
    const { id, old_order, new_order } = body;

    if (
      !id ||
      typeof old_order !== "number" ||
      typeof new_order !== "number"
    ) {
      throw Error(
        "Invalid payload: id, old_order, and new_order are required"
      );
    }

    if (old_order === new_order) {
      return success({ message: "No changes in order" });
    }

    // Build axis conditions based on the current item
    const currentItem = await (prisma as any)[params.model].findUnique({
      where: { id },
    });

    if (!currentItem) {
      throw Error(MESSAGE.MODEL.RECORD.NOT_FOUND);
    }

    // Build where clause for the axis
    const axisConditions = Object.fromEntries(
      mergedConfig.axis.map((field) => [field, currentItem[field]])
    );

    // Start a transaction to reorder entries
    await prisma.$transaction(async (tx) => {
      if (old_order < new_order) {
        // Moving down in the order
        await (tx[params.model as any] as any).updateMany({
          where: {
            ...axisConditions,
            order: {
              gt: old_order,
              lte: new_order,
            },
          },
          data: {
            order: {
              decrement: 1,
            },
          },
        });
      } else {
        // Moving up in the order
        await (tx[params.model as any] as any).updateMany({
          where: {
            ...axisConditions,
            order: {
              gte: new_order,
              lt: old_order,
            },
          },
          data: {
            order: {
              increment: 1,
            },
          },
        });
      }

      // Update the order of the current item
      await (tx[params.model as any] as any).update({
        where: { id },
        data: { order: new_order },
      });
    });

    return success({ message: "Order updated successfully" });
  } catch (err) {
    return exception(err);
  }
}
