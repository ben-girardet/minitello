import { Step  as StepModel } from '@prisma/client';
import { ChevronRight, CircleCheck, Dots } from 'tabler-icons-react';
import { useFetcher } from 'remix';
import styled from 'styled-components';
import React, { useState, MouseEvent } from 'react';


export function StepCreator() {

  return (
    <Wrapper>
      <InputField placeholder='Write your next step'></InputField>
      <Save>
        <ChevronRight></ChevronRight>
      </Save>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  padding: 8px;
  background: hsl(0, 0%, 95%);
  margin: 1px 0;
  display: grid;
  grid-template-columns: 1fr 32px;
  justify-content: space-between;
  align-items: center;
  color: var(--color-foreground);
  cursor: pointer;
  gap: 16px;
`;
const InputField = styled.input`
  background: transparent;
  border: none;
  margin-left: 42px;
  outline-offset: 4px;
`;
const Save = styled.button`
  border: none;
  background: none;
`;
const Main = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  outline-offset: 4px;
`;
const Indicator = styled.button`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  text-align: center;
  color: var(--primary);
  background: var(--primary-contrast);
  border: none;
`;
const Name = styled.div`
  width: 100%;
`;
const More = styled.button`
  display: flex;
  align-items: center;
  margin-left: auto;
  background: transparent;
  border: none;
`;
const WhenOpenedWrapper = styled.div``;
const Children = styled.div``;

/*
.step-creator input {
  width: 100%;
  font-size: 16px;;
}
.step-creator-inactive {
  opacity: 0.5;
}
.step-creator .step-indicator {
  opacity: 0.5;
}
.step-creator:not(.step-creator-can-save) .step-more {
  opacity: 0.5;
}
.step-creator:not(.step-creator-is-started) .step-indicator > * {
  visibility: hidden;
}
*/