import { DataFunctionArgs } from "@remix-run/server-runtime";
import { Link, redirect, useLoaderData, ActionFunction, json, useActionData, MetaFunction, Form } from "remix";
import styled from "styled-components";
import Button from "~/components/button";
import FormError from "~/components/form-error";
import FormLabel from "~/components/form-label";
import Stack from "~/components/stack";
import TextField from "~/components/text-field";
import { FormResult, FormResultGlobalError, getFormDataAsString } from "~/utils/form";
import { getUser, requireUserId } from "~/utils/session.server";
import { StepUtil } from "~/utils/step";

export const meta: MetaFunction = () => {
  return {
    title: "Minitello - Create a project"
  };
};

export const loader = async ({request}: DataFunctionArgs) => {
  const user = await getUser(request);
  if (!user) {
    throw redirect(`/login`);
  }
  
  const data = {
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
    if (action === 'create-project') {
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

  const {user} = useLoaderData<Awaited<ReturnType<typeof loader>>>();
  const actionData = useActionData<FormResult>();

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
          <Stack size="medium">
            <Stack size="small">
              <FormLabel htmlFor="name">Project Name</FormLabel>
              <TextField formResult={actionData?.username} name="name" id="name"></TextField>
              <FormError formResult={actionData?.username} name="username"></FormError>
            </Stack>
            <Stack size="small">
              <FormLabel htmlFor="description">Description</FormLabel>
              <TextField formResult={actionData?.username} name="description" id="description"></TextField>
              <FormError formResult={actionData?.password} name="password"></FormError>
            </Stack>
            <FormError formResult={actionData?._global} name="_global"></FormError>
            <Button variant="fill" size="small" type="submit" name="loginType">Create</Button>
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