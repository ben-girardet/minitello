import { DataFunctionArgs } from "@remix-run/server-runtime";
import { Form, Link, redirect, useLoaderData, MetaFunction, ActionFunction, json, useFetcher, useNavigate } from "remix";
import styled from "styled-components";
import Button from "~/components/button";
import Card from "~/components/card";
import { ProjectPreview } from "~/components/project-preview";
import Stack from "~/components/stack";
import { db } from "~/utils/db.server";
import { getUser, requireUserId } from "~/utils/session.server";
import { FormResult, FormResultGlobalError, getFormDataAsString } from "~/utils/form";
import { StepUtil } from "~/utils/step";
import { useState, MouseEvent } from "react";
import ConfirmDialog from "~/components/confirm";
import { openConfirmDialog } from "~/components/confirm";

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
    if (action === 'delete-project') {
      await StepUtil.deleteProjectFromForm({form, userId});
      throw redirect('');
    } if (action === 'duplicate-project') {
      throw new Error('Not yet implemented');
    } else {
      throw FormResultGlobalError(`Invalid action: ${action}`);
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

  const [deletingProject, setDeletingProject] = useState<{name: string, id: string} | null>(null);
  const deleteProject = (project: {name: string, id: string}) => {
    setDeletingProject(project);
    openConfirmDialog(
      `Deleting ${deletingProject?.name} project ?`,
      () => {
        // onDismiss => do nothing
      },
      () => {
        // onConfirm
        confirmDeleteProject();
      },
      'This action is irreversible'
    );
    console.log('deleting', project);
  };

  function confirmDeleteProject() {
    if (!deletingProject) {
      return;
    }
    const _action = 'delete-project';
    const projectId = deletingProject.id as string;
    fetcher.submit({_action, projectId}, {method: 'put', action: `/projects`});
    setDeletingProject(null);
  }

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
                  <ProjectPreview project={project} onDelete={() => deleteProject(project)} onEdit={() => editProject(project.id)}></ProjectPreview>
                </Link>
              </Card>
            ))}
          </Stack>
        </Stack>
        {/* <ConfirmDialog
          isOpen={isConfirmDeleteOpened}
          title={`Deleting ${deletingProject?.name} project ?`}
          onDismiss={hideConfirmDeleteDialog}
          onConfirm={confirmDeleteProject}
          >
            This action is not reversible
          </ConfirmDialog> */}
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