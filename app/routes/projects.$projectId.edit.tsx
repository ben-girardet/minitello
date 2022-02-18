import { DataFunctionArgs } from "@remix-run/server-runtime";
import { Link, redirect, useLoaderData, ActionFunction, json, useActionData, MetaFunction, Form, useTransition } from "remix";
import styled from "styled-components";
import Button from "~/components/button";
import FormError from "~/components/form-error";
import FormLabel from "~/components/form-label";
import Stack from "~/components/stack";
import TextField from "~/components/text-field";
import { FormResult, FormResultGlobalError, getFormDataAsString, isString } from "~/utils/form";
import { getUser, requireUserId } from "~/utils/session.server";
import { db } from "~/utils/db.server";
import { StepUtil } from "~/utils/step";

export const meta: MetaFunction = ({data}) => {
  return {
    title: `Minitello - Edit Project - ${data.project.name}`
  };
};

export const loader = async ({request, params}: DataFunctionArgs) => {
  const user = await getUser(request);
  if (!user) {
    throw redirect(`/login`);
  }

  const projectId = params.projectId;
  if (!isString(projectId)) {
    throw new Error('Invalid projectId');
  }

  const project = await db.step.findUnique({
    where: {
      id: projectId,
    },
    select: { id: true, name: true, description: true, members: true }
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const data = {
    project,
    user,
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
    if (action === 'create-project') {
      const newProject = await StepUtil.editProjectFromForm({form, userId});
      if (!newProject) {
        throw FormResultGlobalError(`Failed to edit the project`);
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

  const {user, project} = useLoaderData<Awaited<ReturnType<typeof loader>>>();
  const actionData = useActionData<FormResult>();
  const transition = useTransition();

  return (
    <>
      <TopBar>
        {user.username}
        <Form action="/logout" method="post">
          <Button type="submit" variant="fill" size="small">Logout</Button>
        </Form>
      </TopBar>
      <Wrapper>
      <Form
          method="post"
          aria-describedby={
            actionData?._global?.error
              ? "form-error-message"
              : undefined
          }
        >
          <input type="hidden" name="_action" value="create-project"></input>
          <input type="hidden" name="projectId" value={project.id}></input>
          <Stack size="medium">
            <Stack size="small">
              <FormLabel htmlFor="name">Project Name</FormLabel>
              <TextField formResult={actionData?.name} value={project.name} name="name" id="name"></TextField>
              <FormError formResult={actionData?.name} name="name"></FormError>
            </Stack>
            <Stack size="small">
              <FormLabel htmlFor="description">Description</FormLabel>
              <TextField formResult={actionData?.description} value={project.description || ''} name="description" id="description"></TextField>
              <FormError formResult={actionData?.description} name="description"></FormError>
            </Stack>
            <FormError formResult={actionData?._global} name="_global"></FormError>
            <Button variant="fill" size="small" type="submit" name="loginType">Edit</Button>
            <Link to="../">
              <Button variant="ghost" size="small" type="button">Cancel</Button>
            </Link>
          </Stack>
        </Form>
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