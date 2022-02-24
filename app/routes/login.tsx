import { ActionFunction, Form, MetaFunction } from "remix";
import {
  useActionData,
  json,
  useSearchParams
} from "remix";
import { FormResult, FormResultGlobalError, getFormDataAsString } from "~/utils/form";
import { createUserSession } from "~/utils/session.server";
import { UserUtil } from "~/utils/user";
import styled from 'styled-components';
import Card from "~/components/card";
import Button from "~/components/button";
import TextField from "~/components/text-field";
import Stack from "~/components/stack";
import FormError from "~/components/form-error";
import { User, Lock } from 'tabler-icons-react';
import { useState } from "react";
import FormLabel from "~/components/form-label";

export const meta: MetaFunction = () => {
  return {
    title: "Minitello | Login",
    description:
      "Login!"
  };
};

export const action: ActionFunction = async ({
  request
}) => {
  const form = await request.formData();
  const loginType = getFormDataAsString(form, 'loginType');
  const redirectTo = getFormDataAsString(form, 'redirectTo', true);
  try {
    if (loginType === 'login') {
      const user = await UserUtil.loginFromForm({form});
      if (!user) {
        throw FormResultGlobalError(`Username/Password combination is incorrect`);
      }
      return createUserSession(user.id, redirectTo || 'projects');
    } else if (loginType === 'register') {
      const user = await UserUtil.registerFromForm({form});
      return createUserSession(user.id, redirectTo || 'projects');
    } else {
      throw FormResultGlobalError(`Login type invalid`);
    }
  } catch (error) {
    console.log('error', error);
    return json(error as FormResult, {status: 400});
  }
};

export default function Login() {
  const actionData = useActionData<FormResult>();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  if (actionData?.loginType?.value === 'register') {
    setMode('register');
  }

  const setModeRegister = () => {
    setMode('register');
  };

  const setModeLogin = () => {
    setMode('login');
  };

  return (
    <Wrapper>
      <Card>
        <h1>{mode === 'login' ? 'Login' : 'Register'}</h1>
        <Form
          method="post"
          aria-describedby={
            actionData?._global?.error
              ? "form-error-message"
              : undefined
          }
        >
          <input
            type="hidden"
            name="redirectTo"
            value={
              searchParams.get("redirectTo") ?? undefined
            }
          />

            <Stack size="medium">
              <Stack size="small">
                <FormLabel htmlFor="username">Username</FormLabel>
                <TextField start={<User></User>} formResult={actionData?.username} name="username"></TextField>
                <FormError formResult={actionData?.username} name="username"></FormError>
              </Stack>
              <Stack size="small">
                <FormLabel htmlFor="password">Password</FormLabel>
                <TextField start={<Lock></Lock>} formResult={actionData?.username} name="password" id="password" type="password"></TextField>
                <FormError formResult={actionData?.password} name="password"></FormError>
              </Stack>
              <FormError formResult={actionData?._global} name="_global"></FormError>
              <Button variant="fill" size="small" type="submit" name="loginType" value={mode}>Submit</Button>
              {mode === 'login'
                ? <Button variant="ghost" size="small" onClick={setModeRegister} type="button">Create an account</Button>
                : <Button variant="ghost" size="small" onClick={setModeLogin} type="button">Login</Button>
              }          
            </Stack>
        </Form>
      </Card>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: var(--small-container-width);
  max-width: calc(100% - var(--gutter) * 2);
  margin-top: var(--gutter);
  margin-right: auto;
  margin-left: auto;
`;