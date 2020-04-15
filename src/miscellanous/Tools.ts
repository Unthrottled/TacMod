import {NumberDictionary, StringDictionary} from "../types/BaseTypes";

export const objectToArray =
  <T>(object: StringDictionary<T>): T[] =>
    Object.keys(object || {}).map(key => object[key]);

export const numberObjectToArray =
  <T>(object: NumberDictionary<T>): T[] =>
    Object.keys(object || {})
      .map(key => object[key]);

export interface KeyValue<T> {
  key: string,
  value: T,
}

export const objectToKeyValueArray = <T>(object: StringDictionary<T>): KeyValue<T>[] =>
  Object.keys(object || {}).map(key => ({
    key,
    value: object[key],
  }));

export const reverseBinarySearch = <T>(
  list: T[],
  comparator: (arg: T) => number
): number => {
  let low = 0;
  let high = list.length - 1;

  while (low <= high) {
    const mid = (low + high) >>> 1;
    const midVal = list[mid];
    const cmp = comparator(midVal);

    if (cmp > 0)
      low = mid + 1;
    else if (cmp < 0)
      high = mid - 1;
    else
      return mid;
  }
  return -(low + 1);
};
