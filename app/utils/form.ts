export type SingleFormResult = {
  error?: string;
  value?: string;
};

export type FormResult<Key extends string = string> = {
  [key in Key]: SingleFormResult;
};

export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function FormResultGlobalError(message: string, key = '_global'): FormResult {
  const result: FormResult = {};
  result[key] = {error: message};
  return result;
}

export function getFormDataAsString(form: FormData, key: string, failSilently = false): string | undefined {
  const value = form.get(key);
  if (typeof value === 'string' || value === undefined) {
    return value;
  }
  if (failSilently) {
    return undefined;
  }
  throw new Error(`${key} is not a string`);
}