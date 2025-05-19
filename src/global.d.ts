export {}

declare global {
  declare module 'svelte-recaptcha-v2'
  type Operator = 'equals' | 'not' | 'in' | 'notIn' | 'lt' | 'lte' | 'gt' | 'gte' | 'contains' | 'startsWith' | 'endsWith' | 'isNull'

  type Condition<T> = {
    field: keyof T
    operator: Operator
    value?: any
  }

  type ArrayStrategy = 'first' | 'last' | 'all' | {
    where?: {
      field: string
      value: any
    }
  }

  type WhereConfig<T> = {
    AND?: Condition<T>[]
    OR?: Condition<T>[]
    NOT?: Condition<T>[]
  }
  type FieldType = 'file' | 'number' | 'string' | 'multi'

  type FieldTypeConfig =
    | {
        type: 'multi'
        params: {
          by: string
          [key: string]: any
        }
      }
    | {
        type: Exclude<FieldType, 'multi'>
        params?: {
          [key: string]: any
        }
      }
  
  type CustomFieldConfig = {
    name: string,        // Name of the field
    generator: (data: Record<string, any>) => any // Handler function to process the data
  }

  type FieldsForeignConfig<T> = {
    [K in keyof T]?: {
      fields?: string[],
      fieldsForeign?: FieldsForeignConfig<T>
    }
  }

  type Validator = {
    validator: (value: any) => boolean | Promise<boolean>,
    message: string
  }

  type ValidationConfig<T> = {
    [K in keyof T]?: Validator[]
  }

  type TransactionOperationConfig<T> = {
    // Validation config. supports multiple validators per field
    validation?: ValidationConfig<T>,
    lifecycle?: TransactionLifecycleConfig
  }

  type ViewOperationConfig<T> = {
    // References another field from another model
    // Ex. fieldsForeign: {"categories": {fields: ["name"]}}
    //     Will add the "name" field from the "categories" model of data that are correlated with each of the data being listed
    //     There's no need to specify which field relates to which model, as that's already described in the Prisma schema
    fieldsForeign?: FieldsForeignConfig<T>,
    // Custom fields derived from relations
    customFields?: CustomFieldConfig[],
  }

  type DetailLifecycleConfig = {
    // Prepare data before the main update operation
    // Field data augmentation, value derivation, etc.
    // body: Raw data body
    pre?: (urlSearchParams: Record<string, any>) => Promise<Record<string, any>>,
    // Main update operation
    // Ex. use case: Different fields to assign depending on a value of a field
    // body: What's returned by pre
    main?: (where: Record<string, any>, skip?: number, take?: number) => Promise<Record<string, any>>,
    // What to do after the main operation
    // Ex. use case: Create on another model depending on the value of what's being returned from main
    // body: What's returned by main
    post?: (data: Record<string, any>, total?: number) => Promise<Record<string, any>>
  }

  type ListLifecycleConfig = {
    // Prepare data before the main update operation
    // Field data augmentation, value derivation, etc.
    // body: Raw data body
    pre?: (urlSearchParams: Record<string, any>) => Promise<Record<string, any>>,
    // Main update operation
    // Ex. use case: Different fields to assign depending on a value of a field
    // body: What's returned by pre
    main?: (where: Record<string, any>, skip?: number, take?: number) => Promise<Record<string, any>>,
    // What to do after the main operation
    // Ex. use case: Create on another model depending on the value of what's being returned from main
    // body: What's returned by main
    post?: (data: Record<string, any>[], total?: number) => Promise<Record<string, any>>
  }

  type TransactionLifecycleConfig = {
    // Prepare data before the main update operation
    // Field data augmentation, value derivation, etc.
    // body: Raw data body
    pre?: (body: Record<string, any>) => Promise<Record<string, any>>,
    // Main update operation
    // Ex. use case: Different fields to assign depending on a value of a field
    // body: What's returned by pre
    main?: (body: Record<string, any>) => Promise<Record<string, any>>,
    // What to do after the main operation
    // Ex. use case: Create on another model depending on the value of what's being returned from main
    // body: What's returned by main
    post?: (body: Record<string, any>, data: Record<string, any>) => Promise<Record<string, any>>
  }

  type BaseOperationConfig<T> = {
    // Whether to allow the operation or not
    allow?: boolean,
    // Fields that will be operated in the database
    fields?: (keyof T)[],
    // Additional conditions for filtering records
    // Supports complex logical operations (AND, OR, NOT) with various operators
    // Ex. where: {
    //   AND: [
    //     { field: 'gallery_id', operator: 'isNull' },
    //     { field: 'status', operator: 'equals', value: 'active' }
    //   ],
    //   OR: [
    //     { field: 'submenu_id', operator: 'equals', value: 1 },
    //     { field: 'subpage_id', operator: 'equals', value: 2 }
    //   ]
    // }
    where?: WhereConfig<T>,
    // Which fields are used to identify a specific record when performing the update operation
    by?: (keyof T)[],
  }

  type CreateConfig<T> = Omit<BaseOperationConfig<T>, 'where'> & TransactionOperationConfig<T>
  type UpdateConfig<T> = BaseOperationConfig<T> & TransactionOperationConfig<T>
  type ListConfig<T> = BaseOperationConfig<T> & ViewOperationConfig<T> & {
    // Which fields will be matched by the "search" query parameter.
    // Will do a case-insensitive search
    // Ex. searchableBy: ['name', 'age']
    //     .../list?search=Bobby would search the records where the field name contains "bobby" or age contains "bobby"
    //     .../list?search=25 would search the records for the field name contains "25" or age contains "25"
    searchableBy?: (keyof T)[],
    // Which fields will be matched by the "[fieldName]" query parameter
    // Will do a case-sensitive search
    // Ex. filterableBy: ['category_id', 'name']
    //     .../list?category_id=25 would search the records where the field "category_id" is equal to "25"
    //     .../list?name=Bobby%20Anderson would search the records for the field "name" is equal to "Bobby Anderson"
    filterableBy?: (keyof T)[],
    // The order of which the data is being displayed, according to what field
    // Ex. orderBy: {"age": "asc"}
    //     Will return the list of data from the lowest to highest age
    orderBy?: Record<keyof T?, 'asc' | 'desc'>,
    lifecycle?: ListLifecycleConfig,
  }
  type DetailConfig<T> = BaseOperationConfig<T> & ViewOperationConfig<T> & {
    lifecycle?: DetailLifecycleConfig,
  }
  type DeleteConfig<T> = Pick<BaseOperationConfig<T>, 'by' | 'allow' | 'where'>

  type ReorderConfig<T> = Pick<BaseOperationConfig<T>, 'by' | 'allow'> & {
    axis: (keyof T)[],
  }

  type ModelConfig<T> = BaseOperationConfig<T> & {
    view?: ViewOperationConfig<T>,
    transaction?: TransactionOperationConfig<T>,
    // Describes the type of each of the field.
    // Primarily used for declaring which field contains a file URL (of type file)
    // So that that field could be handled accordingly
    // If left unconfigured, all fields are assumed to have the type of the data being received
    // Example:
    // If the field "age" holds the value 25,
    //    Is sent as a FormData to the server
    //       => It would be processed as a number in the server
    //
    //    Is sent as a query parameter to the server
    //       => Since all query parameters are sent as a string,
    //          it would be processed as a string in the server.
    //          Prisma might freak out if you assign the string 25
    //          to the "age" field which has type of number.
    //          So make sure to type fields that are not of type string
    //          properly.
    types?: {[K in keyof T]?: FieldTypeConfig},
    create?: CreateConfig<T>,
    update?: UpdateConfig<T>,
    list?: ListConfig<T>,
    detail?: DetailConfig<T>,
    delete?: DeleteConfig<T>,
    reorder?: ReorderConfig<T>
  }
}

// FORM EVENTS
export type FormInputEvent<T extends Event = Event> = T & {
	currentTarget: EventTarget & HTMLInputElement;
};
export type InputEvents = {
	blur: FormInputEvent<FocusEvent>;
	change: FormInputEvent<Event>;
	click: FormInputEvent<MouseEvent>;
	focus: FormInputEvent<FocusEvent>;
	focusin: FormInputEvent<FocusEvent>;
	focusout: FormInputEvent<FocusEvent>;
	keydown: FormInputEvent<KeyboardEvent>;
	keypress: FormInputEvent<KeyboardEvent>;
	keyup: FormInputEvent<KeyboardEvent>;
	mouseover: FormInputEvent<MouseEvent>;
	mouseenter: FormInputEvent<MouseEvent>;
	mouseleave: FormInputEvent<MouseEvent>;
	mousemove: FormInputEvent<MouseEvent>;
	paste: FormInputEvent<ClipboardEvent>;
	input: FormInputEvent<InputEvent>;
	wheel: FormInputEvent<WheelEvent>;
};