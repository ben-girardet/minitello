import { DataFunctionArgs } from "@remix-run/server-runtime";
import { Form, Link, redirect, useLoaderData } from "remix";
import styled from "styled-components";
import Button from "~/components/button";
import Card from "~/components/card";
import Stack from "~/components/stack";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

export const loader = async ({request}: DataFunctionArgs) => {
  const user = await getUser(request);
  if (!user) {
    throw redirect(`/login`);
  }
  const projects = await db.step.findMany({
    where: {
      members: {
        some: {
          user: {
            id: user?.id
          }
        }
      }
    },
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, members: true }
  });
  
  const data = {
    projects,
    user
  };
  return data;
}

export default function Index() {

  const {projects} = useLoaderData<Awaited<ReturnType<typeof loader>>>();

  return (
    <Wrapper>
      <Stack size="very-large">
        <Stack size="large">
          {projects.map(project => (
            <Card key={project.id}>
              <Project>
                <h2>{project.name}</h2>
                <Link to={project.id}>
                  <Button variant="ghost" size="medium">Open</Button>
                </Link>
              </Project>
            </Card>
          ))}
        </Stack>
        <Form action="/logout" method="post">
          <Button type="submit" variant="fill" size="small">Logout</Button>
        </Form>
      </Stack>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: var(--large-container-width);
  max-width: calc(100% - var(--gutter) * 2);
  margin-top: var(--gutter);
  margin-right: auto;
  margin-left: auto;
`;

const Project = styled.div`
`;