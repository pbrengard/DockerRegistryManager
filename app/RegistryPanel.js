import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import ExpansionPanel, {
  ExpansionPanelDetails,
  ExpansionPanelSummary,
} from 'material-ui/ExpansionPanel';
import Typography from 'material-ui/Typography';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import Chip from 'material-ui/Chip';

const styles = theme => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  chip: {
    margin: theme.spacing.unit / 2,
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
});

class RegistryPanel extends React.Component {
  
  state = {
    expanded: null,
    repositories: [],
  };

  handleChange = panel => (event, expanded) => {
    this.setState({
      expanded: expanded ? panel : false,
    });
  };

  /*
  async getCatalog() {
    //var url_v2 = this.props.url + '/v2/_catalog';
    try {
      let resp = await fetch('/catalog');
      //console.log(resp);
      if (!resp.ok) {
        return null;
      }
      const {responseJ} = await resp.json();
      console.log(responseJ);
      return responseJ.repositories;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  */

  handleTagDelete = (repo, tag) => () => {
    return fetch('/delete?url='+this.props.url+"&repo="+repo+"&tag="+tag)
    .then((response) => response.json() )
    .then((responseJson) => {
        if (responseJson.result === "success") {
          let changed_state = {repositories: this.state.repositories};
          let repoi = changed_state.repositories.map(e => e.name).indexOf(repo);
          console.log(this);
          console.log(this.state.repositories);
          console.log(repoi);
          changed_state.repositories[repoi].tags = changed_state.repositories[repoi].tags.filter(item => item !== tag);
          this.setState(changed_state);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  
  componentDidMount() {
    return fetch('/catalog?url='+this.props.url)
      .then((response) => response.json() )
      .then((responseJson) => {
        this.setState({expanded: null, repositories: responseJson.repositories});
      })
      .catch((error) => {
        console.error(error);
      });
  }
  

  render() {
    const { classes } = this.props;
    const { expanded, repositories } = this.state;
    
    return (
      <div className={classes.root}>
        {repositories.map(function(repo){
          if (repo.tags && repo.tags.length > 0) {
            return <ExpansionPanel expanded={expanded === repo.name} onChange={this.handleChange(repo.name)}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography className={classes.heading}>{repo.name}</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <div className={classes.row}>
                  {repo.tags.map(function(tag){
                    return (
                      <Chip
                        label={tag}
                        key={tag}
                        onDelete={this.handleTagDelete(repo.name, tag)}
                        className={classes.chip}
                      />
                    );
                  }.bind(this))}
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          } else {
            return <ExpansionPanel disabled>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography className={classes.heading}>{repo.name}</Typography>
              </ExpansionPanelSummary>
            </ExpansionPanel>
          }
        }.bind(this))}
      </div>
    );
  }
}

export default withStyles(styles)(RegistryPanel);
