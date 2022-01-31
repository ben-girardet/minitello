import { DataFunctionArgs } from "@remix-run/server-runtime";
import { useEffect, useMemo } from "react";
import { useLoaderData, useMatches, useTransition, redirect } from "remix";

// https://twitter.com/williamsgarth/status/1487038404462362627
// Using data from parent loaders avoids the need for state management.
export const useRouteLoaderData = <Data> (routeId: string): Data => {
  const matches = useMatches();
  const match = useMemo(() => matches.find((match) => match.id === routeId), [routeId, matches]);
  if (!match) {
    throw new Error(`No route found with id: ${routeId}`);
  }
  return match.data as Data;
}