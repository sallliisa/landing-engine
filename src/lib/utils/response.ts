import { json } from "@sveltejs/kit";

export function exception(message: any, status: number = 500) {
  if (message instanceof Error) message = message.message
  return json({message}, {status})
}

export function success(data: any, status: number = 201) {
  return json(data, {status})
}