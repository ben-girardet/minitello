import { Outlet, useLoaderData } from "remix"

export const loader = () => {
  return {
    numbers: [1, 2, 3]
  };
}

export default function Test() {  
  const {numbers} = useLoaderData<Awaited<ReturnType<typeof loader>>>();

  return (
    <>
      <div>Test Main {numbers[0]}</div>
      <Outlet></Outlet>
    </>
  )
}