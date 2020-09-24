import React from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Router from 'next/router';

import {
  makeStyles,
  createMuiTheme,
  ThemeProvider,
} from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import {
  orange,
  lightBlue,
  deepOrange,
  deepPurple,
} from '@material-ui/core/colors';

const palletType = 'dark';
const darkState = false;
const mainPrimaryColor = darkState ? orange[500] : lightBlue[500];
const mainSecondaryColor = darkState ? deepOrange[900] : deepPurple[500];
const theme = createMuiTheme({
  palette: {
    type: palletType,
    primary: {
      main: mainPrimaryColor,
    },
    secondary: {
      main: mainSecondaryColor,
    },
  },
});

const useStyles = makeStyles((_theme) => ({
  paper: {
    marginTop: _theme.spacing(16),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: _theme.spacing(1),
    backgroundColor: _theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: _theme.spacing(3),
  },
  submit: {
    margin: _theme.spacing(3, 0, 2),
  },
  input: {
    color: '#ffff',
  },
}));

type MyProps = {
  classes: {
    paper: string;
    avatar: string;
    form: string;
    submit: string;
    input: string;
  };
  csrf: any;
  loggedIn: any;
};

type MyState = {
  email: string;
  password: string;
  signupError: string;
  username: string;
};

class SignUp extends React.Component<MyProps, MyState> {
  constructor(props: any) {
    super(props);
    if (props.loggedIn) {
      Router.push('/overview');
    }

    this.state = {
      email: '',
      username: '',
      password: '',
      signupError: '',
    };
  }

  render() {
    const { classes, csrf } = this.props;
    const { signupError } = this.state;

    return (
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="sm">
          <CssBaseline />
          <div className={classes.paper}>
            <img
              width="150"
              src="./login.png"
              alt="avatar"
              className="img-responsive"
            />
            <Typography className={classes.input} component="h1" variant="h5">
              Sign up
            </Typography>
            <form
              method="post"
              action="/api/auth/callback/credentials"
              className={classes.form}
            >
              <input name="csrfToken" type="hidden" defaultValue={csrf} />
              <input name="stype" type="hidden" defaultValue="signup" />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12}>
                  <TextField
                    autoComplete="uname"
                    name="username"
                    variant="outlined"
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    onChange={(e) =>
                      this.setState({ username: e.target.value })
                    }
                    autoFocus
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
                    onChange={(e) => this.setState({ email: e.target.value })}
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
                    onChange={(e) =>
                      this.setState({ password: e.target.value })
                    }
                  />
                </Grid>
              </Grid>
              {signupError && <p style={{ color: 'red' }}>{signupError}</p>}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                Sign Up
              </Button>
              <Grid container justify="flex-end">
                <Grid item>
                  <Link href="/login" variant="body2">
                    Already have an account? Sign in
                  </Link>
                </Grid>
              </Grid>
            </form>
          </div>
        </Container>
      </ThemeProvider>
    );
  }
}

export default (props) => {
  const classes = useStyles();
  return (
    <SignUp classes={classes} csrf={props.csrf} loggedIn={props.loggedIn} />
  );
};
