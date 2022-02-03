import { LoaderFunction, MetaFunction, redirect } from "remix";
import { getUserId } from "~/utils/session.server";

export const loader: LoaderFunction = async ({
  request
}) => {
  const userId = await getUserId(request);
  if (!userId) {
    return redirect('/login');
  }
  return redirect('/projects');
};


export const meta: MetaFunction = () => {
  return {
    title: "Minitello",
    description:
      "Handle your projects with ease"
  };
};

export default function IndexRoute() {
  return (<></>);
}