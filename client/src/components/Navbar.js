import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
//import IconButton from '@material-ui/core/IconButton';
//import MenuIcon from '@material-ui/icons/Menu';
//import { getThemeProps } from '@material-ui/styles';
import { withRouter } from "react-router-dom";
 
const useStyles = makeStyles(theme => ({
   
    Toolbar: {
        width: 100,
    },
      
    root: {
    flexGrow: 2,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  control: {
     

  }
}));

 function ButtonAppBar(props) {
  const classes = useStyles();

  const logOut = ()=> {
      localStorage.removeItem("JWT");
     props.history.push("/signin")

  }

  return (
    <div className={classes.root}>
      <AppBar position="static" color="black">
        <Toolbar>
          {/* <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton> */}
          <Typography variant="h6" className={classes.title}>
            Musicians Keeper
          </Typography>
          <Button onClick={ logOut }color="inherit">LogOut</Button>
        </Toolbar>
      </AppBar>
    </div>
  );
}
export default withRouter(ButtonAppBar);