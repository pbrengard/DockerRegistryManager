import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';

import TextField from 'material-ui/TextField';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';

import ListSubheader from 'material-ui/List/ListSubheader';
import List, {
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import DeleteIcon from 'material-ui-icons/Delete';
import AddIcon from 'material-ui-icons/Add';
import SettingsIcon from 'material-ui-icons/Settings';

import RegistryList from './RegistryList';


const styles = theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    background: theme.palette.background.paper,
  },
  flex: {
    flex: 1,
  },
  nested: {
    paddingLeft: theme.spacing.unit * 4,
  },
  button: {
    margin: theme.spacing.unit,
  },
});

class InteractiveList extends React.Component {
  state = {
    dense: false,
    secondary: false,
  };

  render() {
    const { classes } = this.props;
    const { dense, secondary } = this.state;

    return (
      <List className={classes.root} subheader={<ListSubheader>localhost 5000</ListSubheader>}>
        <ListItem button>
          <ListItemText
            primary="Single-line item"
          />
          <ListItemSecondaryAction>
            <IconButton aria-label="Delete">
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    );
  }
}


class ButtonAppBar extends React.Component {
  state = {
    //dense: false,
    //secondary: false,
    dialog_open: false,
    url_value: "http://localhost:5000",
  };

  handleClickOpen = () => {
    this.setState({ dialog_open: true });
  };

  handleClose = () => {
    this.setState({ dialog_open: false });
  };
  
  handleAdd = () => {
    this.setState({ dialog_open: false });
    var url_v2 = this.state.url_value + '/v2/'
    // test
    fetch(url_v2, { method: 'GET', mode: 'no-cors', Accept: 'application/vnd.docker.distribution.manifest.v2+json'} )
     .then((response) => {
     //.then((responseJson) => {
      //console.log(response);
      var stored = localStorage.getItem("DockerRegistryWebUI_registries");
      //console.log(stored);
      var regs = JSON.parse(stored) || new Array;
      if (regs.indexOf(this.state.url_value) == -1) {
        regs.push(this.state.url_value);
      }
      //console.log(JSON.stringify(regs));
      localStorage.setItem("DockerRegistryWebUI_registries", JSON.stringify(regs));
      this.registry_list.handleStorage();
    })
    .catch((error) => {
      console.error(error);
    });
    //console.log(this.state.url_value);
    //alert(this.state.url_value)
    
  };


  render() {
    const { classes } = this.props;
    //const { dialog_open, url_value } = this.state;

    return (
      <div>
      <AppBar position="static">
        <Toolbar>
          <Typography type="title" color="inherit" className={classes.flex}>
            Docker Registry Manager
          </Typography>
          <Button fab mini color="accent" aria-label="add" className={classes.button} onClick={this.handleClickOpen}>
            <AddIcon />
          </Button>
          <Button fab mini color="accent" aria-label="settings" className={classes.button}>
            <SettingsIcon />
          </Button>

          <Dialog
            open={this.state.dialog_open}
            onClose={this.handleClose}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="form-dialog-title">Add Registry</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Add a Docker Registry
              </DialogContentText>
              <TextField
                autoFocus
                //margin="dense"
                id="name"
                ref="url"
                label="URL"
                type="url"
                defaultValue={this.state.url_value}
                fullWidth
                onChange={(e) => this.setState({url_value:e.target.value})}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose} color="primary">
                Cancel
              </Button>
              <Button onClick={this.handleAdd} color="primary">
                Add
              </Button>
            </DialogActions>
          </Dialog>
        </Toolbar>
      </AppBar>
      <RegistryList innerRef={instance => { this.registry_list = instance; }} />
      </div>
    );
  }
}


//export default withStyles(styles)(InteractiveList);
export default withStyles(styles)(ButtonAppBar);
