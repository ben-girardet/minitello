import { Step, User } from "@prisma/client";
import { db } from "./db.server";
import { FormResult, FormResultGlobalError, isNumber, isString } from "./form";

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
    let order = typeof form.get("order") === 'string' ?  parseInt(form.get("order") as string, 10) : -1;

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

    if (order === -1) {
      const nbExistingChildren = await db.step.count({where: {parentStepId}});
      order = nbExistingChildren;
    }

    const newStep = await db.step.create({
      data: {
        name,
        projectId,
        createdById: userId,
        parentStepId: parentStepId,
        order,
      }
    });

    await StepUtil.updateProjectTree(newStep);

    return newStep;
  }

  public static async createProjectFromForm({form, userId}: {form: FormData, userId: string}): Promise<Step> {
    const name = form.get("name");
    const description = form.get("description") || '';
    
    const result: FormResult = {_global: {}};
    if (
      !isString(name) ||
      !isString(description)
    ) {
      throw FormResultGlobalError(`Form not submitted correctly.`);
    }

    result.name = { value: name, error: StepUtil.validateName(name) };

    if (Object.values(result).map(r => r.error).some(Boolean)) {
      throw result;
    }

    const project = await db.step.create({
      data: {
        name,
        description,
        order: 0,
        createdById: userId,
        members: {
          create: {
            user: {
              connect: {
                id: userId
              }
            },
            role: 'MANAGER'
          }
        }
      }
    });
  
    return project;
  }

  public static async editProjectFromForm({form, userId}: {form: FormData, userId: string}): Promise<Step> {
    const projectId = form.get("projectId");
    const name = form.get("name");
    const description = form.get("description") || '';
    
    const result: FormResult = {_global: {}};
    if (
      !isString(projectId) ||
      !isString(name) ||
      !isString(description)
    ) {
      throw FormResultGlobalError(`Form not submitted correctly.`);
    }

    result.name = { value: name, error: StepUtil.validateName(name) };

    if (Object.values(result).map(r => r.error).some(Boolean)) {
      throw result;
    }

    const updatedProject = await db.step.update({where: {id: projectId}, data: {name, description}});  
    return updatedProject;
  }

  public static async deleteProjectFromForm({form, userId}: {form: FormData, userId: string}): Promise<void> {
    const projectId = form.get("projectId");
    
    const result: FormResult = {_global: {}};
    if (
      !isString(projectId)
    ) {
      throw FormResultGlobalError(`Form not submitted correctly.`);
    }

    if (Object.values(result).map(r => r.error).some(Boolean)) {
      throw result;
    }

    console.log('ready to delete project', projectId);

    await db.userProjects.deleteMany({where: {projectId}});
    await db.step.delete({where: {id: projectId}});
    await db.step.deleteMany({where: {projectId}});
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

    const updatedStep = await db.step.update({where: {id: stepId}, data: {progress: newProgress}});  
    await StepUtil.updateProjectTree(updatedStep);
    return updatedStep;
  }

  public static async moveStep({form, userId}: {form: FormData, userId: string}): Promise<Step> {
    const projectId = form.get("projectId");
    const stepId = form.get("stepId");
    const newParentStepId = form.get("newParentStepId");
    
    if (
      !isString(projectId) ||
      !isString(stepId) ||
      !isString(newParentStepId) ||
      typeof form.get("newOrder") !== 'string'
      ) {
        throw FormResultGlobalError(`Form not submitted correctly.`);
      }
    const newOrder = parseInt(form.get("newOrder") as string, 10);

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

    if (newParentStepId === step.parentStepId) {
      // the step is moving inside the same parent, therfore changing order
      if (step.order === newOrder) {
        return step;
      }

      // 0 - ABC
      // 1 - DEF
      // 2 - GHI
      // 3 - JKL
      // 4 - MNO
      // 5 - PQR

      // Move UP
      // Move (step.order) 1 ->  (newOrder) 4
      // Increment (-1) steps from 2 to 4
      
      // 0 - ABC
      // 1 - GHI (-1)
      // 2 - JKL (-1)
      // 3 - MNO (-1)
      // 4 - DEF (newOrder)
      // 5 - PQR

      // Move DOWN
      // Move (step.order) 4 ->  (newOrder) 1
      // Increment (+1) steps from 1 to 3

      // 0 - ABC
      // 1 - MNO (newOrder)
      // 2 - DEF (+1)
      // 3 - GHI (+1)
      // 4 - JKL (+1)
      // 5 - PQR

      const moveUp = step.order < newOrder;
      const increment = moveUp ? -1 : 1;
      const incrementFrom = moveUp ? step.order + 1 : newOrder;
      const incrementTo = moveUp ? newOrder : step.order - 1;

      await db.step.updateMany({
        where: {
          parentStepId: step.parentStepId,
          order: {gte: incrementFrom, lte: incrementTo},
        }, 
        data: {
          order: {increment}
        }
      });
      const updatedStep = await db.step.update({where: {id: step.id}, data: {order: newOrder}});
      return updatedStep;
    } else {
      // the step is moving from one parent to another

      const decrementOriginalFrom = step.order;
      const incrementNewFrom = newOrder;
      const parentId = step.parentStepId || step.projectId;
      const originalParent = await db.step.findUnique({where: {id: parentId}});
      if (!originalParent) {
        throw new Error('Original parent not found');
      }

      await db.step.updateMany({
        where: {
          parentStepId: step.parentStepId,
          order: {gte: decrementOriginalFrom},
        }, 
        data: {
          order: {increment: -1}
        }
      });

      await db.step.updateMany({
        where: {
          parentStepId: newParentStepId,
          order: {gte: incrementNewFrom},
        }, 
        data: {
          order: {increment: 1}
        }
      });

      const updatedStep = await db.step.update({where: {id: step.id}, data: {parentStepId: newParentStepId, order: newOrder}});
      await StepUtil.updateProjectTree(updatedStep);
      const originalParentChildren = await db.step.findMany({where: {parentStepId: originalParent.id}});
      if (originalParentChildren.length) {
        await StepUtil.updateProjectTree(originalParentChildren[0]);
      } else {
        if (originalParent.progress !== 0 && originalParent.progress !== 1) {
          originalParent.progress = 0;
          await db.step.update({where: {id: originalParent.id}, data: {progress: originalParent.progress}});
          await StepUtil.updateProjectTree(originalParent);
        }
      }
      return updatedStep;
    }
  }
  public static async deleteStep({form, userId}: {form: FormData, userId: string}): Promise<void> {
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

    // get all project steps
    const steps = await StepUtil.getProjectsSteps({project, userId, select: {id: true}, computeChildren: true});

    // find the step to delete
    const stepToDelete = steps.find(s => s.id === stepId);

    if (!stepToDelete) {
      throw new Error('Step to delete not found');
    }

    console.log('stepToDelete', stepToDelete);

    // parse step and its children to compute a list of ids to delete
    const stepIdsToDelete: string[] = [stepToDelete.id];
    function parseStepChildren(step: StepWithChildren) {
      for (const child of step.children || []) {
        stepIdsToDelete.push(child.id);
        parseStepChildren(child);
      }
    }
    parseStepChildren(stepToDelete);
    const result = await db.step.deleteMany({where: {id: {in: stepIdsToDelete}}});
  }

  private static async updateProjectTree(relatedToStep: Step): Promise<void> {
    // updating progress down
    const referenceStep = await db.step.findUnique({where: {id: relatedToStep.id}});
    if (!referenceStep) {
      throw new Error('Related step not found');
    }
    if (referenceStep.progress === 0 || referenceStep.progress === 1) {
      await StepUtil.updateProgressDown(referenceStep.id, referenceStep.progress);
    }
    await StepUtil.updateProgressUp(relatedToStep);
  }

  private static async updateProgressDown(parentStepId: string, progress: 0 | 1): Promise<void> {
    const result = await db.step.updateMany({where: {parentStepId}, data: {progress}});
    if (result.count) {
      const steps = await db.step.findMany({where: {parentStepId}});
      for (const step of steps) {
        await StepUtil.updateProgressDown(step.id, progress);
      }
    }
  }

  private static async updateProgressUp(step: Step): Promise<void> {
    const parentStepId = step.parentStepId || step.projectId;
    if (!parentStepId) {
      return;
    }
    const parentStep = await db.step.findUnique({where: {id: parentStepId}});
    if (!parentStep) {
      throw new Error('Parent step not found');
    }
    const children = await db.step.findMany({where: {parentStepId: parentStep.id}});
    const progress = children.reduce((prev, curr) => prev + curr.progress, 0) / children.length;
    parentStep.progress = progress;
    await db.step.update({where: {id: parentStep.id}, data: {progress}});
    await StepUtil.updateProgressUp(parentStep);
  }

  // TODO: add selectors to avoid fetching all data
  public static async getProjectsSteps({
    project,
    userId,
    select,
    computeChildren,
    computeParent,
  }: {
    project: {id: string},
    userId: string,
    // the any here comes because I cannot import the `StepSelect` type
    // from @prisma/client
    select?: any,
    computeChildren?: boolean,
    computeParent?: boolean,
  }): Promise<StepWithChildren[]> {
  
    const userProject = await db.userProjects.findFirst({where: {
      userId: userId,
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
      },
      orderBy: {
        order: 'asc'
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