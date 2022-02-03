import { ActionFunction, Form, MetaFunction } from "remix";
import {
  useActionData,
  json,
  useSearchParams
} from "remix";
import { FormResult, FormResultGlobalError, getFormDataAsString } from "~/utils/form";
import { createUserSession } from "~/utils/session.server";
import { UserUtil } from "~/utils/user";


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
  console.log('loginType', loginType);
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
  return (
    <div className="container">
      <div className="content" data-light="">
        <h1>Login</h1>
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
          <fieldset>
            <legend className="sr-only">
              Login or Register?
            </legend>
            <label>
              <input
                type="radio"
                name="loginType"
                value="login"
                defaultChecked={
                  !actionData?.loginType?.value ||
                  actionData?.loginType?.value === "login"
                }
              />{" "}
              Login
            </label>
            <label>
              <input
                type="radio"
                name="loginType"
                value="register"
                defaultChecked={
                  actionData?.loginType?.value ===
                  "register"
                }
              />{" "}
              Register
            </label>
          </fieldset>
          <div>
            <label htmlFor="username-input">Username</label>
            <input
              type="text"
              id="username-input"
              name="username"
              defaultValue={actionData?.username?.value}
              aria-invalid={Boolean(
                actionData?.username?.error
              )}
              aria-describedby={
                actionData?.username?.error
                  ? "username-error"
                  : undefined
              }
            />
            {actionData?.username?.error ? (
              <p
                className="form-validation-error"
                role="alert"
                id="username-error"
              >
                {actionData?.username.error}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              name="password"
              defaultValue={actionData?.password?.value}
              type="password"
              aria-invalid={
                Boolean(
                  actionData?.password?.error
                ) || undefined
              }
              aria-describedby={
                actionData?.password?.error
                  ? "password-error"
                  : undefined
              }
            />
            {actionData?.password?.error ? (
              <p
                className="form-validation-error"
                role="alert"
                id="password-error"
              >
                {actionData?.password.error}
              </p>
            ) : null}
          </div>
          <div id="form-error-message">
            {actionData?._global?.error ? (
              <p
                className="form-validation-error"
                role="alert"
              >
                {actionData?._global?.error}
              </p>
            ) : null}
          </div>
          <button type="submit" className="button">
            Submit
          </button>
        </Form>
      </div>
    </div>
  );
}