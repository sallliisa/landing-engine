import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function isEmptyObject(object: Record<any, any>) {
  return Object.keys(object).length === 0 && object.constructor === Object
}

export function omitIfEmptyObject(object: Record<any, any>) {
  if (isEmptyObject(object)) return undefined
  else return object
}

export function transformFieldsForeign(fieldsForeign: any): any {
  return Object.fromEntries(
    Object.entries(fieldsForeign).map(([key, value]: any) => {
      const select: any = {};

      // Add fields directly to select if they exist
      if (value.fields) {
        value.fields.forEach((field: string) => {
          select[field] = true;
        });
      }

      // Recurse into fieldsForeign, merging it directly into select
      if (value.fieldsForeign) {
        Object.assign(select, transformFieldsForeign(value.fieldsForeign));
      }
      return [key, { select }];
    })
  );
}

// Add helper function to build where clause
export function buildWhereClause(whereConfig: WhereConfig<any>) {
  const result: any = {};
  
  if (whereConfig.AND) {
    result.AND = whereConfig.AND.map(condition => ({
      [condition.field]: condition.operator === 'isNull' 
        ? null 
        : { [condition.operator]: condition.value }
    }));
  }
  
  if (whereConfig.OR) {
    result.OR = whereConfig.OR.map(condition => ({
      [condition.field]: condition.operator === 'isNull' 
        ? null 
        : { [condition.operator]: condition.value }
    }));
  }

  if (whereConfig.NOT) {
    result.NOT = whereConfig.NOT.map(condition => ({
      [condition.field]: condition.operator === 'isNull' 
        ? null 
        : { [condition.operator]: condition.value }
    }));
  }

  return result;
}

export async function validateFields(data: Record<string, any>, validation?: ValidationConfig<any>) {
  if (!validation) return

  for (const [field, validators] of Object.entries(validation)) {
    if (!validators) continue
    
    for (const { validator, message } of validators) {
      const isValid = await validator(data[field])
      if (!isValid) {
        throw new Error(`Validation failed for field '${field}': ${message}`)
      }
    }
  }
}

export function formatCurrency(num: number | undefined | null, locale = 'ID', currency = 'IDR') {
  return num != null ? new Intl.NumberFormat(locale, { style: 'currency', currency }).format(num) : '-'
}

export function formatDate(date: string | undefined | null, options?: Intl.DateTimeFormatOptions, locale = 'id-ID') {
  return date ? new Date(date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric', ...(options ? options : {}) }) : '-'
}

export function formatTime(date: string | undefined | null, options?: Intl.DateTimeFormatOptions, locale = 'id-ID') {
  return date ? new Date(date).toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', ...(options ? options : {}) }) : '-'
}

export function formatDateTime(date: string | undefined | null, options?: Intl.DateTimeFormatOptions, locale = 'id-ID') {
  return date ? new Date(date).toLocaleString(locale, { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', ...(options ? options : {}) }) : '-'
}

export function formatNumber(num: number | undefined | null, locale = 'id-ID') {
  return num != null ? new Intl.NumberFormat(locale, { style: 'decimal' }).format(num) : '-'
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getLanguagePrefix(pathname: string): string | null {
  const match = pathname.match(/[^/]+?(?=\/|$)/)
  return match ? match[0] : null;
}

export function isValidUrl (url: string) {
  try { 
    return Boolean(new URL(url)); 
  }
  catch(e){ 
    return false; 
  }
}

export function isFileURL(url: string) {
  return !!url.split(/[#?]/)[0].split('.').pop()?.trim();
}

export function parseSearchParams(searchParams: URLSearchParams): Record<string, unknown> {
  const parsed: Record<string, unknown> = {};

  for (const [key, value] of searchParams.entries()) {
    parsed[key] = castValue(value);
  }

  return parsed;
}

export function castValue(value: string): unknown {
  // Check for numbers
  if (!isNaN(Number(value)) && value.trim() !== '') {
    return Number(value);
  }

  // Check for boolean
  const lowerValue = value.toLowerCase();
  if (lowerValue === 'true') {
    return true;
  }
  if (lowerValue === 'false') {
    return false;
  }

  // Check for JSON-like objects or arrays
  try {
    const json = JSON.parse(value);
    if (typeof json === 'object' && json !== null) {
      return json;
    }
  } catch {
    // Not valid JSON
  }

  // Return as string if nothing else matches
  return value;
}

let n = Date.now();

export function useId() {
  return (++n).toString(36);
} 

export function generateGoogleMapsEmbedURL(url: string)
{
  let coords = /\@([0-9\.\,\-a-zA-Z]*)/.exec(url);
  if(coords!=null)
  {
    let coordsArray = coords[1].split(',');
    return "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d20000!2d"+coordsArray[1]+"!3d"+coordsArray[0]+"!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2suk!4v1486486434098";
  }
}

export function getCurrencySymbol (locale: string, currency: string) {
  return (0).toLocaleString(
    locale,
    {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }
  ).replace(/\d/g, '').trim()
}

export const defer = () => {
  var res, rej;

  var promise: any = new Promise((resolve, reject) => {
      res = resolve;
      rej = reject;
  });

  promise.resolve = res;
  promise.reject = rej;

  return promise;
};

export function parseSlug(text: string) {
  return text
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading and trailing whitespace
    .normalize("NFD") // Normalize to decompose accents
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric characters (except spaces and hyphens)
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with a single hyphen
}