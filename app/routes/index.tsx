// Route rendered on /

import { useLoaderData } from "remix";
import styled from "styled-components";
import { db } from '~/utils/db.server';
import { Step } from '~/components/step';
import * as ReactDOM from 'react-dom';
import React from 'react';
import ContextualMenu from "~/components/contextual-menu";
import { StepCreator } from "~/components/step-creator";

export const loader = async () => {
  const steps = await db.step.findMany();
  return {steps};
}

export default function Index() {

  const {steps} = useLoaderData<Awaited<ReturnType<typeof loader>>>();

  return (
    <div>
      {steps.map(step => (
        <Step step={step} key={step.id}></Step>
      ))}
      <StepCreator></StepCreator>
    </div>
  );
}

const Button = styled.button`
  background: var(--primary);
`;
