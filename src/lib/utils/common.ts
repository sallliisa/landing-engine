import type { Language } from "@prisma/client";
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

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export function resolveCustomField(data: any, path: string[], arrayStrategy?: ArrayStrategy): any {
  let value = data;
  for (const segment of path) {
    if (!value) return null;
    
    if (Array.isArray(value)) {
      if (!arrayStrategy || arrayStrategy === 'first') {
        value = value[0]?.[segment];
      } else if (arrayStrategy === 'last') {
        value = value[value.length - 1]?.[segment];
      } else if (arrayStrategy === 'all') {
        value = value.map(item => item[segment]);
      } else if (typeof arrayStrategy === 'object' && arrayStrategy.where) {
        const { field, value: matchValue } = arrayStrategy.where;
        value = value.find(item => item[field] === matchValue)?.[segment];
      }
    } else {
      value = value[segment];
    }
  }
  return value;
}

export const languages: Language[] = ['id', 'en'];

export function isFileURL(url: string) {
  return !!url.split(/[#?]/)[0].split('.').pop()?.trim();
}

export function isOfSameOrigin(url: string) {
  try {
    const urlObj = new URL(url);
    const appUrl = process.env.PUBLIC_APP_URL || '';
    
    // If PUBLIC_APP_URL is set, verify the origin matches
    if (appUrl) {
      const appOrigin = new URL(appUrl).origin;
      if (urlObj.origin !== appOrigin) {
        return false;
      }
    }
    
    return true;
  } catch (e) {
    // If URL parsing fails, it's not a valid URL
    return false;
  }
}

export function isValidTempFileURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // If PUBLIC_APP_URL is set, verify the origin matches
    if (!isOfSameOrigin(url)) return false
    
    // Check if path matches /storage/temp/(public|private)/...
    const tempPathRegex = /^\/storage\/temp\/(public|private)\/.+/;
    return tempPathRegex.test(urlObj.pathname);
  } catch (e) {
    // If URL parsing fails, it's not a valid temp file URL
    return false;
  }
}

export function isValidFileURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // If PUBLIC_APP_URL is set, verify the origin matches
    if (!isOfSameOrigin(url)) return false
    
    // Check if path starts with /storage/
    return urlObj.pathname.startsWith('/storage/');
  } catch (e) {
    // If URL parsing fails, it's not a valid file URL
    return false;
  }
}

export function parseSearchParams(
  searchParams: URLSearchParams | string | null | undefined
): Record<string, unknown> {
  const parsed: Record<string, unknown> = {};

  // Handle null/undefined input
  if (searchParams == null) {
    return parsed;
  }

  // Convert string to URLSearchParams if needed
  const params = typeof searchParams === 'string' 
    ? new URLSearchParams(searchParams)
    : searchParams;

  // Handle case where URLSearchParams is empty
  if (params.toString().trim() === '') {
    return parsed;
  }

  // Process each parameter
  for (const [key, value] of params.entries()) {
    if (!key) continue; // Skip empty keys
    
    const trimmedValue = value.trim();
    
    // Handle multiple values for the same key by converting to array
    if (key in parsed) {
      const existingValue = parsed[key];
      if (Array.isArray(existingValue)) {
        existingValue.push(castValue(trimmedValue));
      } else {
        parsed[key] = [existingValue, castValue(trimmedValue)];
      }
    } else {
      parsed[key] = castValue(trimmedValue);
    }
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

export function parseCode(text: string) {
  return text
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading and trailing whitespace
    .normalize("NFD") // Normalize to decompose accents
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9_\s]/g, "") // Remove non-alphanumeric characters (except spaces and underscores)
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/_+/g, "_"); // Replace multiple underscores with a single underscore
}

export type ProcessFileUrlOptions = {
	onTempFile?: (url: string) => Promise<string | undefined>;
	onClearFile?: (url: string) => Promise<void>;
	previousData?: Record<string, any>;
	onFile?: (url: string) => Promise<void>;
};

/**
 * Recursively processes an object to handle file URLs.
 * @param obj - The object to process
 * @param options - Configuration options
 * @returns A new object with processed file URLs
 */
export async function processFileUrls<T extends Record<string, any>>(
	obj: T,
	options: ProcessFileUrlOptions = {}
): Promise<T> {
	const { onTempFile, onClearFile, previousData, onFile } = options;
	const result: Record<string, any> = Array.isArray(obj) ? [...obj] : { ...obj };

	for (const [key, value] of Object.entries(result)) {
		if (value === null || value === undefined) continue;

		// Handle nested objects and arrays
		if (typeof value === 'object') {
			result[key] = await processFileUrls(value, { ...options, previousData: previousData?.[key] });
			continue;
		}

		// Handle string values that might be file URLs
		if (typeof value === 'string') {
			if (isValidFileURL(value)) {
				if (onFile) {
					await onFile(value);
				}
				
				if (isValidTempFileURL(value) && onTempFile) {
					// Process temp file URL
					result[key] = await onTempFile(value);
				} else if (!value && previousData?.[key] && onClearFile) {
					// Handle file clearing
					await onClearFile(previousData[key]);
				}
			}
		}
	}

	return result as T;
}

export const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), ms)
  }
}