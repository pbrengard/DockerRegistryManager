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
import Menu, { MenuItem } from 'material-ui/Menu';

import IconButton from 'material-ui/IconButton';
import DeleteIcon from 'material-ui-icons/Delete';
import DnsIcon from 'material-ui-icons/Dns';
import AddIcon from 'material-ui-icons/Add';
import SettingsIcon from 'material-ui-icons/Settings';

import RegistryList from './RegistryList';

const styles = theme => ({
  app: {
    width: '100%',
  },
  flex: {
    flex: 1,
  },
  button: {
    margin: theme.spacing.unit,
  },
});

class ButtonAppBar extends React.Component {
  state = {
    dialog_open: false,
    url_value: "http://localhost:5000",
    registry_menu_open: false,
    registry_menu_anchorEl: null,
    registries: JSON.parse(localStorage.getItem("DockerRegistryWebUI_registries")) || [],
    selected_registry: JSON.parse(localStorage.getItem("DockerRegistryWebUI_registries")) ? JSON.parse(localStorage.getItem("DockerRegistryWebUI_registries"))[0] : null,
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
      var regs = JSON.parse(stored) || new Array;
      if (regs.indexOf(this.state.url_value) == -1) {
        regs.push(this.state.url_value);
      }
      localStorage.setItem("DockerRegistryWebUI_registries", JSON.stringify(regs));
      //this.registry_list.handleStorage();
      this.setState({ selected_registry: this.state.url_value, registries: regs });
    })
    .catch((error) => {
      console.error(error);
    });
  };


  handleOpenRegistryMenu = event => {
    this.setState({ registry_menu_open: true, registry_menu_anchorEl: event.currentTarget });
  };

  handleCloseRegistryMenu = () => {
    this.setState({ registry_menu_open: false });
  };

  handleSelectRegistry = (event, registry) => {
    this.setState({ selected_registry: registry, registry_menu_open: false });
  };

  render() {
    const { classes } = this.props;
    
    return (
      <div className={classes.app}>
      <AppBar position="static">
        <Toolbar>
          <Typography type="title" color="inherit" className={classes.flex}>
            Docker Registry Manager
          </Typography>
          <Button fab mini color="accent" aria-label="select" className={classes.button} onClick={this.handleOpenRegistryMenu}>
            <DnsIcon />
          </Button>
          <Button fab mini color="accent" aria-label="add" className={classes.button} onClick={this.handleClickOpen}>
            <AddIcon />
          </Button>
          <Button fab mini color="accent" aria-label="settings" className={classes.button}>
            <SettingsIcon />
          </Button>
          
          <Menu
            id="registry-menu"
            anchorEl={this.state.registry_menu_anchorEl}
            open={this.state.registry_menu_open}
            onClose={this.handleCloseRegistryMenu}
          > 
            {this.state.registries.map(registry => 
              <MenuItem 
                onClick={ event => this.handleSelectRegistry(event, registry) }
                selected={ registry === this.state.selected_registry }>
                  {registry}
              </MenuItem>
            )}
          </Menu>

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
      <RegistryList url={this.state.selected_registry} />
      </div>
    );
  }
}


export default withStyles(styles)(ButtonAppBar);
