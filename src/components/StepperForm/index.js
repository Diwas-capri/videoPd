import React, { useEffect, useState } from "react";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import useSocket from "../../hooks/useSocket";
import { useSocketContext } from "../../context/SocketContext";

const StepperForm = ({ setInitiateCall, initiateCall }) => {
  const [formData, setFormData] = useState({
    workingPlace: "",
    workingYears: "",
    overallExperience: "",
    currentDesignation: "",
    grossSalary: "",
    salaryCreditDate: "",
    obligations: "",
    loanAmount: "",
    loanPurpose: "",
    otherIncome: "",
    familyDetails: "",
  });
  const { socket, connected, receiveEventdata } = useSocketContext();

  useEffect(() => {
    if (receiveEventdata) {
      try {
        const parsedData = JSON.parse(receiveEventdata);
        setFormData((prev) => ({ ...prev, ...parsedData }));
      } catch (error) {
        console.error("Error parsing received message:", error);
      }
    }
  }, [receiveEventdata]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    socket.send(formData);
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "600px",
        mx: "auto",
        p: 1,
      }}
      component={Paper}
    >
      <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: 600 }}>
        Questions
      </Typography>
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          maxHeight: '650px',
          pr: 1,
        }}
      >
        <TextField
          label="Where are you working?"
          name="workingPlace"
          value={formData.workingPlace}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="From how many years are you working?"
          name="workingYears"
          value={formData.workingYears}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Overall work experience?"
          name="overallExperience"
          value={formData.overallExperience}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="What is your current designation?"
          name="currentDesignation"
          value={formData.currentDesignation}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="What is the Gross salary?"
          name="grossSalary"
          value={formData.grossSalary}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="On which date your salary gets credited?"
          name="salaryCreditDate"
          value={formData.salaryCreditDate}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="What all obligations you have?"
          name="obligations"
          value={formData.obligations}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="How much loan you require?"
          name="loanAmount"
          value={formData.loanAmount}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Why do you need these funds?"
          name="loanPurpose"
          value={formData.loanPurpose}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Do you have any other source of income?"
          name="otherIncome"
          value={formData.otherIncome}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Who all are in your family?"
          name="familyDetails"
          value={formData.familyDetails}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />

        
      </Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 3 }}>
          {!initiateCall && (
            <Button
              onClick={() => setInitiateCall(true)}
              variant="contained"
              color="primary"
            >
              Initiate Video
            </Button>
          )}
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>

    </Box>
  );
};

export default StepperForm;
