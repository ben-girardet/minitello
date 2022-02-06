import { Step, User } from "@prisma/client";
import { db } from "./db.server";
import { FormResult, FormResultGlobalError, isString } from "./form";

export interface StepWithChildren extends Step {
  children?: StepWithChildren[];
  parent?: StepWithChildren;
}
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

  // TODO: add selectors to avoid fetching all data
  public static async getProjectsSteps({
    project,
    user,
    select,
    computeChildren,
    computeParent,
  }: {
    project: {id: string},
    user: User,
    // the any here comes because I cannot import the `StepSelect` type
    // from @prisma/client
    select?: any,
    computeChildren?: boolean,
    computeParent?: boolean,
  }): Promise<StepWithChildren[]> {
  
    const userProject = await db.userProjects.findFirst({where: {
      userId: user.id,
      projectId: project.id
    }});

    if (!userProject) {
      throw new Error('Access denied');
    }

    // TODO: query selectors ??
    const projectStep = await db.step.findUnique({where: {id: project.id}, select});
    if (!projectStep) {
      throw new Error('Project not found');
    }
    
    const steps: StepWithChildren[] = await db.step.findMany({
      where: {
        projectId: project.id
      }
    });

    
    if (computeChildren || computeParent) {
      // compute a temporary horizontal map of all children
      const hSteps: {[key: string]: StepWithChildren} = {};
      steps.reduce((hSteps, step) => {
        // using this reduce step to prepare the children array
        step.children = [];
        hSteps[step.id] = step;
        return hSteps;
      }, hSteps);

      // build the hierarchical tree using the hSteps map
      for (const step of steps) {
        if (step.parentStepId && hSteps[step.parentStepId]) {
          const parentStep = hSteps[step.parentStepId];
          if (computeChildren) {
            parentStep.children!.push(step);
          }
          if (computeParent) {
            step.parent = parentStep;
          }
        }
      }
    }

    return steps;
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