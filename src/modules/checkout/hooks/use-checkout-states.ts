import { parseAsBoolean, useQueryStates } from "nuqs";

/**
 * A hook to read and manage query state parameters related to checkout
 * process. Returns an object with `success` and `cancel` properties that
 * are boolean values indicating if the checkout was successful or canceled
 * respectively. The values are parsed from query state parameters with the
 * same names, and have default values of `false` if the parameter is not
 * present in the query string.
 *
 * The `clearOnDefault` option is enabled for both properties, which means
 * that setting either `success` or `cancel` to `false` will remove the
 * parameter from the query string. This is useful for implementing a
 * redirect back to the checkout page after a successful checkout or
 * cancellation.
 *
 * @returns An object with `success` and `cancel` properties that are
 *          boolean values.
 */
export const useCheckoutStates = () => {
  return useQueryStates({
    success: parseAsBoolean.withDefault(false).withOptions({
      clearOnDefault: true,
    }),
    cancel: parseAsBoolean.withDefault(false).withOptions({
      clearOnDefault: true,
    }),
  });
};
