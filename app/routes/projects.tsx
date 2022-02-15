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
    select: { id: true, name: true, description: true, members: true }
  });
  
  const data = {
    projects,
    user
  };
  return data;
}

export default function Index() {

  const {projects, user} = useLoaderData<Awaited<ReturnType<typeof loader>>>();

  return (
    <>
      <TopBar>
        {user.username}
        <Form action="/logout" method="post">
          <Button type="submit" variant="fill" size="small">Logout</Button>
        </Form>
      </TopBar>
      <Wrapper>
        <Stack size="very-large">
          <Link to="new">
            <Button variant="outline" size="small">Create new project</Button>
          </Link>
          <Stack size="large">
            {projects.map(project => (
              <Card key={project.id}>
                <Project>
                  <div>
                    <h2>{project.name}</h2>
                    <p>{project.description || ''}</p>
                  </div>
                  <Link to={project.id}>
                    <Button variant="ghost" size="medium">Open</Button>
                  </Link>
                </Project>
              </Card>
            ))}
          </Stack>
        </Stack>
      </Wrapper>
    </>
  );
}

const TopBar = styled.nav`
  display: flex;
  padding: 8px;
  justify-content: space-between;
  align-items: center;
  background-color: var(--primary);
  color: var(--primary-contrast);
`;

const Wrapper = styled.div`
  width: var(--large-container-width);
  max-width: calc(100% - var(--gutter) * 2);
  margin-top: var(--gutter);
  margin-right: auto;
  margin-left: auto;
`;

const Project = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;