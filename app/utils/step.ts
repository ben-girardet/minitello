import { Step, User } from "@prisma/client";
import { db } from "./db.server";
import { FormResult, FormResultGlobalError, isString } from "./form";

export class StepUtil {

  public static validateName(name: unknown) {
    if (typeof name !== "string" || name.length < 3) {
      return `Name must be at least 3 characters long`;
    }
  }

  /**
   * Validate the form to create a new step
   * If the step is successfully created, it will be returned in the promise
   * If an error occur, a FormResult will be thrown
   * 
   * @param {request}
   * @returns 
   */
  public static async createFromCreator({form, userId}: {form: FormData, userId: string}): Promise<Step> {
    const projectId = form.get("projectId");
    const name = form.get("name");
    const parentStepId = form.get("parentStepId");

    const result: FormResult = {_global: {}};
    if (
      !isString(projectId) ||
      !isString(parentStepId) ||
      !isString(name)
    ) {
      throw FormResultGlobalError(`Form not submitted correctly.`);
    }

    result.name = { value: name, error: StepUtil.validateName(name) };

    if (Object.values(result).map(r => r.error).some(Boolean)) {
      throw result;
    }

    const project = await db.step.findUnique({where: {id: projectId}});
    if (!project) {
      throw FormResultGlobalError('Project not found');
    }
    // TODO: ensure the user has the right to write in this project

    const parentStep = await db.step.findUnique({where: {id: parentStepId}});
    if (!parentStep) {
      throw FormResultGlobalError('Parent step not found');
    } else if (parentStep.projectId !== projectId && parentStepId !== projectId) {
      throw FormResultGlobalError('Invalid parent step, wrong project');
    }

    const newStep = await db.step.create({
      data: {
        name,
        projectId,
        createdById: userId,
        parentStepId: parentStepId,
      }
    });

    return newStep;
  }

  public static async toggleProgress({form, userId}: {form: FormData, userId: string}): Promise<Step> {
    const projectId = form.get("projectId");
    const stepId = form.get("stepId");

    if (
      !isString(projectId) ||
      !isString(stepId)
    ) {
      throw FormResultGlobalError(`Form not submitted correctly.`);
    }

    const project = await db.step.findUnique({where: {id: projectId}});
    if (!project) {
      throw FormResultGlobalError('Project not found');
    }
    // TODO: ensure the user has the right to write in this project

    const step = await db.step.findUnique({where: {id: stepId}});
    if (!step) {
      throw FormResultGlobalError('Step not found');
    } else if (step.projectId !== projectId) {
      throw FormResultGlobalError('Invalid step, wrong project');
    }

    const newProgress = step.progress === 1 ? 0 : 1;

    // TODO: here we must do something to compute the progress of children and parents of this step
    const updatedStep = await db.step.update({where: {id: stepId}, data: {progress: newProgress}});  

    return updatedStep;
  }

  public static async getStepsWithParentId(parentStepId: string, user: User): Promise<Step[]> {
    const parentStep = await db.step.findUnique({where: {id: parentStepId}});
    if (!parentStep) {
      throw new Error('Parent step not found');
    }

    const isParentStepProject = !parentStep.parentStepId || parentStep.parentStepId === parentStep.projectId;

    const userProject = await db.userProjects.findFirst({where: {
      userId: user.id,
      projectId: isParentStepProject ? parentStep.id : parentStep.projectId!
    }});
    
    if (!userProject || userProject.role !== 'MANAGER' || userProject.role !== 'MANAGER') {
      throw new Error('Access denied');
    }

    const steps = await db.step.findMany({
      where: {
        parentStepId
      }
    });
    return steps;
  }

}