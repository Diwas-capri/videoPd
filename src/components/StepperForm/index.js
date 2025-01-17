import React, { useState } from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Box,
  Typography,
} from '@mui/material';

const StepperForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
  });

  const steps = ['Personal Details', 'Account Details', 'Address'];

  const handleNext = () => {
    if (isStepValid()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return formData.name.trim() !== '' && /\S+@\S+\.\S+/.test(formData.email);
      case 1:
        return formData.password.trim().length >= 6;
      case 2:
        return formData.address.trim() !== '';
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    console.log('Form Submitted', formData);
  };

  return (
    <Box sx={{ width: '100%', p: 4 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length ? (
        <Typography variant="h5" align="center" sx={{ mb: 4 }}>
          All steps completed - You’re finished!
        </Typography>
      ) : (
        <>
          <Box component="form" sx={{ mb: 4 }}>
            {activeStep === 0 && (
              <>
                <TextField
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
              </>
            )}
            {activeStep === 1 && (
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                required
                sx={{ mb: 2 }}
                helperText="Password must be at least 6 characters long"
              />
            )}
            {activeStep === 2 && (
              <TextField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button variant="contained" onClick={handleSubmit}>
                Finish
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                Next
              </Button>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default StepperForm;
