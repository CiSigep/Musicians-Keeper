import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import axios from "axios";
import { withRouter } from "react-router-dom";

const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function SignUp(props) {
  const classes = useStyles();

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const registerObj ={
      firstName: document.querySelector("#firstName").value,
      lastName: document.querySelector("#lastName").value,
      username: document.querySelector("#username").value,
      password: document.querySelector("#password").value,
      email: document.querySelector("#email").value,
    };
    axios.post("/register", registerObj) 
   .then((response) => {
      props.history.push("/signin");
    })
    .catch((error) => {
      let errorsCopy = JSON.parse(JSON.stringify(errors));
      for(let prop in errorsCopy){
        errorsCopy[prop].error = true
      }
      errorsCopy["password"].message = error.response.data.message;

      setErrors(errorsCopy);
    })
  }

  const [errors, setErrors] = useState({
    firstName: {
      error: false,
      message: ""
    },
    lastName: {
      error: false,
      message: ""
    },
    email: {
      error: false,
      message: ""
    },
    username: {
      error: false,
      message: ""
    },
    password: {
      error: false,
      message: ""
    }
  });

  const handleChange = (e) => {
    let errorsCopy = JSON.parse(JSON.stringify(errors));
    for(let prop in errorsCopy){
      errorsCopy[prop].error = false;
      errorsCopy[prop].message = "";
    }
    setErrors(errorsCopy);
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
      <Typography component="h1" variant="h5">
            Musician's Keeper
           </Typography>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <form className={classes.form} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="fname"
                name="firstName"
                variant="outlined"
                required
                fullWidth
                id="firstName"
                label="First Name"
                autoFocus
                error={errors.firstName.error}
                helperText={errors.firstName.message}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="lname"
                error={errors.lastName.error}
                helperText={errors.lastName.message}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                error={errors.email.error}
                helperText={errors.email.message}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                error={errors.username.error}
                helperText={errors.username.message}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                error={errors.password.error}
                helperText={errors.password.message}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={handleSubmit}
          >
            Sign Up
          </Button>
          <Grid container justify="flex-end">
            <Grid item>
              <Link href="/signin" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
}

export default withRouter(SignUp);