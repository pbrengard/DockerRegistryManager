import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import RegistryPanel from './RegistryPanel';

const styles = theme => ({
  root: theme.mixins.gutters({
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit * 3,
  }),
});


class RegistryList extends React.Component {
  
  state = {
    registries: JSON.parse(localStorage.getItem("DockerRegistryWebUI_registries")) || [],
  };

  componentDidMount() {
    window.addEventListener("storage", this.handleStorage, false);
  }
  componentWillUnmount() {
    window.removeEventListener("storage", this.handleStorage, false);
  }
  handleStorage = (event) => 
    this.setState({registries: JSON.parse(localStorage.getItem("DockerRegistryWebUI_registries")) || [] });
    
  render() {
    const { classes } = this.props;
    //const { dialog_open, url_value } = this.state;

    return (
      <div>
      {this.state.registries.map(item => 
        <Paper className={classes.root} elevation={4}>
          <Typography type="headline" component="h3">
            {item}
          </Typography>
          <RegistryPanel url={item} />
        </Paper>
      )}
      </div>
    );
  }
}

export default withStyles(styles)(RegistryList);
