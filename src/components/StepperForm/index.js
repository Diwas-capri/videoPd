import React, { useEffect, useState } from "react";
import { Box, Button, TextField, Typography, Grid, Divider, Paper } from "@mui/material";
import useSocket from "../../hooks/useSocket";

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
  const { socket, connected, sendMessage } = useSocket();

  useEffect(() => {
    if (socket && connected) {
      socket.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          setFormData((prev) => ({ ...prev, ...parsedData }));
        } catch (error) {
          console.error("Error parsing message:", error, event.data);
        }
      };
    }
  }, [socket, connected]);

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
        p: 3,
        mt: 4,
        background: "#fff",
        borderRadius: 2,
        boxShadow: 3,
      }}
      component={Paper}
    >
      <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: 600 }}>
        PD Questions
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ overflowY: "auto", maxHeight: "700px", pr: 1 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
          Work Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Where are you working?"
              name="workingPlace"
              value={formData.workingPlace}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="From how many years are you working?"
              name="workingYears"
              value={formData.workingYears}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Overall work experience?"
              name="overallExperience"
              value={formData.overallExperience}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="What is your current designation?"
              name="currentDesignation"
              value={formData.currentDesignation}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
          Financial Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="What is the Gross salary?"
              name="grossSalary"
              value={formData.grossSalary}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="On which date your salary gets credited?"
              name="salaryCreditDate"
              value={formData.salaryCreditDate}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="What all obligations you have?"
              name="obligations"
              value={formData.obligations}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="How much loan you require?"
              name="loanAmount"
              value={formData.loanAmount}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Why do you need these funds?"
              name="loanPurpose"
              value={formData.loanPurpose}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
          Additional Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Do you have any other source of income?"
              name="otherIncome"
              value={formData.otherIncome}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Who all are in your family?"
              name="familyDetails"
              value={formData.familyDetails}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
        </Grid>
      </Box>

      <Box
        sx={{
          mt: 3,
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
        }}
      >
        {!initiateCall && (
          <Button
            onClick={() => setInitiateCall(true)}
            variant="contained"
            color="primary"
          >
            Initiate Video
          </Button>
        )}
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default StepperForm;
