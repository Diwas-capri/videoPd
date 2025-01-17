import { Box } from "@mui/material";
import React, { useState } from "react";
import StepperForm from "../StepperForm";
import AgentVideoScreen from "./AgentVideoBox";

const MainScreen = () => { 
  const [initiateCall, setInitiateCall] = useState(false);
  return (
    <Box sx={{ width: '100%', p: 4 , display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      {initiateCall && <AgentVideoScreen setInitiateCall={setInitiateCall} initiateCall={initiateCall} />}
      <StepperForm setInitiateCall={setInitiateCall} initiateCall={initiateCall} />
    </Box>
  )
}

export default MainScreen;