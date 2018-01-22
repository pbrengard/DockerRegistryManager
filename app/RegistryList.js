import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import ListSubheader from 'material-ui/List/ListSubheader';
import List, { ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction } from 'material-ui/List';
import Collapse from 'material-ui/transitions/Collapse';
import IconButton from 'material-ui/IconButton';

import LabelIcon from 'material-ui-icons/Label';
import StorageIcon from 'material-ui-icons/Storage';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';
import DeleteIcon from 'material-ui-icons/Delete';

import RegistryPanel from './RegistryPanel';

const styles = theme => ({
  list: {
    width: '100%',
    maxWidth: 360,
    margin: 4,
    background: theme.palette.background.paper,
  },
  subheader: {
    'font-weight': 700
  },
  nested: {
    paddingLeft: theme.spacing.unit * 4,
  },
});

class RegistryList extends React.Component {
  
  state = {
    repositories: [],
    opened_repository: null,
  };

  componentDidMount() {
    return fetch('/catalog?url='+this.props.url)
      .then((response) => response.json() )
      .then((responseJson) => {
        this.setState({repositories: responseJson.repositories});
      })
      .catch((error) => {
        console.error(error);
      });
  }

  handleClickRepository = (repo) => () => {
    let will_open = this.state.opened_repository !== repo;
    let changed_state = { opened_repository: will_open ? repo : null };
    if (will_open) {
      // that is maybe wrong, a deep copy would seem better
      changed_state.repositories = this.state.repositories;
      let repoi = changed_state.repositories.map(e => e.name).indexOf(repo);
      if (repoi != -1) {
        fetch('/tags?url='+this.props.url+"&repo="+repo)
          .then((response) => response.json() )
          .then((responseJson) => {
            changed_state.repositories[repoi] = responseJson;
            this.setState(changed_state);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    } else {
      this.setState(changed_state);
    }
  };

  handleClickDelete = (repo, tag) => () => {
    return fetch('/delete?url='+this.props.url+"&repo="+repo+"&tag="+tag)
    .then((response) => response.json() )
    .then((responseJson) => {
        if (responseJson.result === "success") {
          let changed_state = {repositories: this.state.repositories};
          let repoi = changed_state.repositories.map(e => e.name).indexOf(repo);
          if (repoi != -1) {
            changed_state.repositories[repoi].tags = changed_state.repositories[repoi].tags.filter(item => item !== tag);
            this.setState(changed_state);
          }
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  render() {
    const { classes } = this.props;
    
    return (
      <List className={classes.list} subheader={<ListSubheader className={classes.subheader}>{this.props.url}</ListSubheader>}>
        {this.state.repositories.map(repository =>
          <div>
          <ListItem button onClick={this.handleClickRepository(repository.name)}>
            <ListItemIcon>
              <LabelIcon />
            </ListItemIcon>
            <ListItemText inset primary={repository.name} />
            {this.state.opened_repository === repository.name ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse component="li" in={this.state.opened_repository === repository.name} timeout="auto" unmountOnExit>
            <List disablePadding>
              {(repository.tags || []).map(tag =>
                <ListItem button className={classes.nested}>
                  <ListItemIcon>
                    <StorageIcon />
                  </ListItemIcon>
                  <ListItemText inset primary={tag.name} secondary={(new Date(tag.date)).toLocaleDateString()}/>
                  <ListItemSecondaryAction onClick={this.handleClickDelete(repository.name, tag.name)}>
                      <IconButton aria-label="Delete">
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
              )}
            </List>
          </Collapse>
          </div>
        )}
      </List>
    );
  }
}

export default withStyles(styles)(RegistryList);
