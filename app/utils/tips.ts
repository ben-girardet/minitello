import { DataFunctionArgs } from "@remix-run/server-runtime";
import { useEffect, useMemo } from "react";
import { useLoaderData, useMatches, useTransition, redirect } from "remix";

// https://twitter.com/williamsgarth/status/1487038404462362627
// Using data from parent loaders avoids the need for state management.
export const useRouteLoaderData = <Data> (routeId: string): Data => {
  const matches = useMatches();
  const match = useMemo(() => matches.find((match) => match.id === routeId), [routeId, matches]);
  if (!match) {
    throw new Error(`No route found with id: S{routeld}`);
  }
  return match.data as Data;
}

// https://twitter.com/williamsgarth/status/1487038404462362627
// Combining useMatches and useTransition lets you do interesting things 
// (such as global notification handlers that detect notification messages returned by any loader).
export const useInterestingHook = () => {
  const matches = useMatches();
  const transition = useTransition();
  useEffect(() => {
    if (transition.state === 'idle') {
      // interesting thing
    }
  }, [transition.state, matches]);
}

// https://twitter.com/williamsgarth/status/1487038404462362627
// Use type inference for loader and action data.
export const loader = async ({request}: DataFunctionArgs) => {
  const user = {
    id: 'abc',
    firstname: 'def'
  };
  return {user};
}

export default function App () {
  const { user } = useLoaderData<Awaited<ReturnType<typeof loader>>>();
}

// https://twitter.com/williamsgarth/status/1487038404462362627
// Oh yes, and to avoid redirects or error responses messing with inferred types, use throw instead of return.
export const loader2 = async ({request}: DataFunctionArgs) => {
  const user = {
    id: 'abc',
    firstname: 'def'
  };

  if (!user) {
    // don't return redirect, that will break the
    // useLoaderData typing
    throw redirect('/');
  }

  return {user};
}

export declare type Params<Key extends string = string> = {
  readonly [key in Key]: string | undefined;
};

type FormResult<Key extends string = string> = {
  [key in Key]: {
    error?: string;
    value?: string;
  };
};
