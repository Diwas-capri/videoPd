import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Container,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const OTPVerificationModal = ({ open, setConfirmJoin }) => {
  const [step, setStep] = useState("send");
  const [phoneNumber, setPhoneNumber] = useState("7892398764");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [dummyOtp, setDummyOtp] = useState("123456");

  const handleSendOtp = () => {
    if (phoneNumber.length === 10) {
      setStep("verify");
    } else {
      alert("Please enter a valid phone number.");
    }
  };

  const handleChangeOtp = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      const nextField = document.getElementById(`otp-input-${index + 1}`);
      if (nextField) nextField.focus();
    }
  };

  const handleBackspaceOtp = (index) => {
    if (otp[index] === "" && index > 0) {
      const prevField = document.getElementById(`otp-input-${index - 1}`);
      if (prevField) prevField.focus();
    }
  };

  const handleVerifyOtp = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp === dummyOtp) {
      setStep("send");
      setOtp(new Array(6).fill(""));
      setPhoneNumber("");
      const confirmJoin = (
        "OTP Verified Successfully!"
      );
      if (confirmJoin && setConfirmJoin) {
        setConfirmJoin(true);
      }
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };

  return (
    <Modal open={open}>
      <>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 450 },  // Adjust width for mobile screens
            padding: { xs: 2, sm: 3 },  // Add padding for smaller screens
            bgcolor: "background.paper",
            boxShadow: 4,
            borderRadius: 2,
            zIndex: 9999, // Ensure modal is above other content
          }}
        >
          <Container>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                {step === "send" ? "Send OTP" : "Verify OTP"}
              </Typography>
              <IconButton onClick={() => setConfirmJoin(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
              {step === "send" ? (
                <>
                  <Typography variant="body1" mb={2}>
                    Enter your phone number to receive an OTP:
                  </Typography>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={phoneNumber}
                    disabled
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    inputProps={{ maxLength: 10 }}
                    sx={{ mb: 3 }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSendOtp}
                    disabled={phoneNumber.length !== 10}
                    sx={{ py: 1.5 }}
                  >
                    Send OTP
                  </Button>
                </>
              ) : (
                <>
                  <Typography variant="body1" mb={2}>
                    Enter the 6-digit OTP sent to {phoneNumber}:
                  </Typography>
                  <Grid container spacing={1} justifyContent="center" mb={3}>
                    {otp.map((digit, index) => (
                      <Grid item key={index}>
                        <TextField
                          id={`otp-input-${index}`}
                          value={digit}
                          onChange={(e) => handleChangeOtp(e.target.value, index)}
                          onKeyDown={(e) => {
                            if (e.key === "Backspace") handleBackspaceOtp(index);
                          }}
                          inputProps={{
                            maxLength: 1,
                            style: { textAlign: "center", fontSize: "1.5rem" },
                          }}
                          sx={{ width: 40 }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  <Box display="flex" justifyContent="space-between" gap={2}>
                    <Button
                      onClick={() => setStep("send")}
                      variant="outlined"
                      sx={{ width: "50%" }}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleVerifyOtp}
                      variant="contained"
                      disabled={otp.some((digit) => digit === "")}
                      sx={{ width: "50%" }}
                    >
                      Verify OTP
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Container>
        </Box>
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(100px)",
            zIndex: 999,
          }}
        />
      </>
    </Modal>
  );
};

export default OTPVerificationModal;
