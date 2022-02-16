import { DataFunctionArgs } from "@remix-run/server-runtime";
import { Form, Link, redirect, useLoaderData, MetaFunction } from "remix";
import styled from "styled-components";
import Button from "~/components/button";
import Card from "~/components/card";
import ProgressIndicator from "~/components/progress-indicator";
import Stack from "~/components/stack";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

export const meta: MetaFunction = () => {
  return {
    title: "Minitello - Projects",
    description:
      "Handle your projects with ease"
  };
};

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
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, description: true, progress: true, members: true }
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
                <Link to={project.id} style={{textDecoration: 'none'}}>
                  <Project>
                    <Indicator progress={project.progress} size={3}></Indicator>
                    <Label>
                      <Name>{project.name}</Name>
                      <Description>{project.description}</Description>
                    </Label>
                  </Project>
                </Link>
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
  gap: 16px;
`;

const Indicator = styled(ProgressIndicator)`
  flex: 0 0 3rem;
`;
const Label = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: var(--foreground);
`;
const Name = styled.div`
  font-weight: bold;
`;
const Description = styled.div`
  font-size: 0.8rem;
`; 