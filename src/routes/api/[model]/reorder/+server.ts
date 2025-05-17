import { MESSAGE } from "$lib/app/api/constants.js";
import { configs } from "$lib/app/api/models/_index";
import prisma from "$lib/utils/prisma.js";
import { reorderEntries } from "$lib/utils/reorder";
import { exception, success } from "$lib/utils/response";

// --- REORDER FUNCTION ---

// --- MAIN HANDLER ---
export async function PUT({ params, request }) {
  try {
    const body = await request.json();
    const { id, old_order, new_order } = body;

    const result = await reorderEntries({
      oldOrder: old_order,
      newOrder: new_order,
      model: params.model,
      id,
    });

    return success(result);
  } catch (err) {
    return exception(err);
  }
}
