import { useRouteLoaderData } from "~/utils/data";

export default function Test() {
  const {numbers} = useRouteLoaderData<{numbers: number[]}>('routes/test');

  return (
    <div>Test here {numbers[0]}, {numbers[1]}</div>
  )
}