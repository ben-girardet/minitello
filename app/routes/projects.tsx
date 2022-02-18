import { DataFunctionArgs } from "@remix-run/server-runtime";
import { Form, Link, redirect, useLoaderData, MetaFunction, ActionFunction, json, useFetcher, useNavigate, useHref } from "remix";
import styled from "styled-components";
import Button from "~/components/button";
import Card from "~/components/card";
import { ProjectPreview } from "~/components/project-preview";
import Stack from "~/components/stack";
import { db } from "~/utils/db.server";
import { getUser, requireUserId } from "~/utils/session.server";
import { FormResult, FormResultGlobalError, getFormDataAsString } from "~/utils/form";
import { StepUtil } from "~/utils/step";

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

export const action: ActionFunction = async ({
  request
}) => {
  const userId = await requireUserId(request);
  const form = await request.formData();
  const action = getFormDataAsString(form, '_action');
  try {
    if (action === 'edit-project') {
      const newProject = await StepUtil.createProjectFromForm({form, userId});
      if (!newProject) {
        throw FormResultGlobalError(`Failed to create the step`);
      }
      return redirect(`/projects/${newProject.id}`)
    } if (action === 'delete-project') {
      const newProject = await StepUtil.createProjectFromForm({form, userId});
      if (!newProject) {
        throw FormResultGlobalError(`Failed to create the step`);
      }
      return redirect(`/projects/${newProject.id}`)
    }  if (action === 'duplicate-project') {
      const newProject = await StepUtil.createProjectFromForm({form, userId});
      if (!newProject) {
        throw FormResultGlobalError(`Failed to create the step`);
      }
      return redirect(`/projects/${newProject.id}`)
    } else {
      throw FormResultGlobalError(`Invalid action`);
    }
  } catch (error) {
    return json(error as FormResult, {status: 400});
  }
};

export default function Index() {

  const {projects, user} = useLoaderData<Awaited<ReturnType<typeof loader>>>();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  
  const editProject = (projectId: string) => {
    navigate(`/projects/${projectId}/edit`);
  };

  const deleteProject = (projectId: string) => {
    console.log('deleting', projectId);
  };

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
                  <ProjectPreview project={project} onDelete={() => deleteProject(project.id)} onEdit={() => editProject(project.id)}></ProjectPreview>
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