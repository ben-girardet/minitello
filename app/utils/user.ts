import { FormResult, FormResultGlobalError, isString } from './form';
import { db } from "~/utils/db.server";
import { User } from '@prisma/client';
import { createUserSession, login, register } from './session.server';

export class UserUtil {

  public static validateUsername(username: unknown) {
    if (typeof username !== "string" || username.length < 3) {
      return `Usernames must be at least 3 characters long`;
    }
  }
  
  public static validatePassword(password: unknown) {
    if (typeof password !== "string" || password.length < 6) {
      return `Passwords must be at least 6 characters long`;
    }
  }

  /**
   * Validate the form to register a new user
   * If the user is successfully created, it will be returned in the promise
   * If an error occur, a FormResult will be thrown
   * 
   * @param {request}
   * @returns 
   */
  public static async registerFromForm({form}: {form: FormData}): Promise<User> {
    const username = form.get("username");
    const password = form.get("password");

    const result: FormResult = {_global: {}};
    if (
      !isString(username) ||
      !isString(password)
    ) {
      throw FormResultGlobalError(`Form not submitted correctly.`);
    }

    result.username = { value: username, error: UserUtil.validateUsername(username) };
    result.password = { value: password, error: UserUtil.validatePassword(password) };

    if (Object.values(result).map(r => r.error).some(Boolean)) {
      throw result;
    }

    const userExists = await db.user.findFirst({
      where: { username }
    });
    if (userExists) {
      throw FormResultGlobalError(`User with username ${username} already exists`);
    }
    const user = await register({ username, password });
    if (!user) {
      throw FormResultGlobalError(`Something went wrong trying to create a new user.`);
    }
    return user;
  }

  public static async loginFromForm({form}: {form: FormData}): Promise<User | null> {
    const username = form.get("username");
    const password = form.get("password");

    console.log('up', username, password);

    if (
      !isString(username) ||
      !isString(password)
    ) {
      throw FormResultGlobalError(`Form not submitted correctly.`);
    }

    return login({ username, password });
  }

}