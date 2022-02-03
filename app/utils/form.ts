export type FormResult<Key extends string = string> = {
  [key in Key]: {
    error?: string;
    value?: string;
  };
};

export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function FormResultGlobalError(message: string): FormResult {
  const result: FormResult = {
    _global: {error: message}
  };
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