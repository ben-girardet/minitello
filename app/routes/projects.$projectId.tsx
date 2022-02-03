import { DataFunctionArgs } from "@remix-run/server-runtime";
import { Link, redirect, useLoaderData } from "remix";
import styled from "styled-components";
import { ChevronLeft } from "tabler-icons-react";
import Button from "~/components/button";
import Stack from "~/components/stack";
import { Step } from "~/components/step";
import { StepCreator } from "~/components/step-creator";
import { db } from "~/utils/db.server";
import { isString } from "~/utils/form";
import { getUser } from "~/utils/session.server";

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
      id: projectId
    },
    select: { id: true, name: true, members: true }
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const steps = await db.step.findMany({
    where: {
      projectId
    }
  });

  const data = {
    project,
    user,
    steps,
  };
  return data;
}

export default function Index() {

  const {project, steps} = useLoaderData<Awaited<ReturnType<typeof loader>>>();

  return (
    <Wrapper>
      <Stack size="large">
        <h1>
          <Link to="../projects">
            <Button variant="ghost" size="medium">
              <ChevronLeft></ChevronLeft>
            </Button>
            </Link>
          {project.name}
        </h1>
        <div>
          {steps.map(step => (
            <Step step={step} key={step.id}></Step>
          ))}
          <StepCreator></StepCreator>
        </div>
      </Stack>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: var(--large-container-width);
  max-width: calc(100% - var(--gutter) * 2);
  margin-top: var(--gutter);
  margin-right: auto;
  margin-left: auto;
`;