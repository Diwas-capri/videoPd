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
        alignItems: "stretch",
        gap: 3,
      }}
    >
      {initiateCall && (
        <Paper
          sx={{
            flex: 1,
            padding: 3,
            borderRadius: 2,
            boxShadow: 3,
            transition: "width 0.3s",
            display: "flex",
            flexDirection: "column",
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
          flex: 1,
          padding: 3,
          borderRadius: 2,
          boxShadow: 3,
          transition: "width 0.3s",
          display: "flex",
          flexDirection: "column",
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
