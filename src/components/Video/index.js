import { Box, Paper } from "@mui/material";
import React, { useState } from "react";
import StepperForm from "../StepperForm";
import AgentVideoScreen from "./AgentVideoBox";

const MainScreen = () => {
  const [initiateCall, setInitiateCall] = useState(false);

  return (
    <Box
      sx={{
        width: "100%",
        p: 4,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
      }}
    >
      {initiateCall && (
        <Paper
          sx={{
            width: initiateCall ? "50%" : "100%",
            padding: 3,
            borderRadius: 2,
            boxShadow: 3,
            transition: "width 0.3s",
          }}
        >
          <AgentVideoScreen
            setInitiateCall={setInitiateCall}
            initiateCall={initiateCall}
          />
        </Paper>
      )}
      <Paper
        sx={{
          width: initiateCall ? "50%" : "100%",
          padding: 3,
          borderRadius: 2,
          boxShadow: 3,
          transition: "width 0.3s",
        }}
      >
        <StepperForm
          setInitiateCall={setInitiateCall}
          initiateCall={initiateCall}
        />
      </Paper>
    </Box>
  );
};

export default MainScreen;
